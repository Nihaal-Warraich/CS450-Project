import React, { Component } from "react";
import * as d3 from "d3";
import csvUrl from "../Sleep_health_and_lifestyle_dataset.csv";

class StoryPoint2 extends Component {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
    this.state = {
      viewMode: "compare", // state will update via radio selection
      tooltip: { visible: false, x: 0, y: 0, id: "", sleep: 0, stress: 0, count: 0 }
    };
  }

  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.viewMode !== this.state.viewMode) {
      this.drawChart();
    }
  }

  drawChart() {
    const dataPromise = this.props.data ? Promise.resolve(this.props.data) : d3.csv(csvUrl);

    dataPromise.then(rawData => {
      // group records by stress level -> calculate avg and count
      const processGroup = (data) => {
        return d3.rollups(data, 
          v => ({
            avgSleep: d3.mean(v, d => +d['Sleep Duration']),
            count: v.length 
          }), 
          d => +d['Stress Level']
        )
        .map(([stress, obj]) => ({ 
          stress, 
          sleep: obj.avgSleep, 
          count: obj.count 
        }))
        .sort((a, b) => a.stress - b.stress);
      };

      let chartData = [];

      // compare avg btwn genders
      if (this.state.viewMode === "compare") {
        chartData = d3.groups(rawData, d => d['Gender']).map(([gender, values]) => ({
          id: gender,
          color: gender === "Male" ? "#229cffff" : "#ff6d9eff",
          values: processGroup(values)
        }));
      } else { // aggregate 
        chartData = [{
          id: "Total",
          color: "#8d5ddfff",
          values: processGroup(rawData)
        }];
      }

      // dims
      const margin = { top: 50, right: 120, bottom: 60, left: 60 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svgEl = d3.select(this.svgRef.current);
      svgEl.selectAll("*").remove();
      
      const svg = svgEl
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // scales
      const xScale = d3.scaleLinear().domain([1, 10]).range([0, width]);
      const yScale = d3.scaleLinear().domain([5.5, 9]).range([height, 0]);

      // axes
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(10))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "#333")
        .style("font-weight", "bold")
        .text("Stress Level (1-10)");

      svg.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -height / 2)
        .attr("fill", "#333")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Avg Sleep Duration (Hours)");

      // lines/points
      const lineGen = d3.line()
        .x(d => xScale(d.stress))
        .y(d => yScale(d.sleep))
        .curve(d3.curveMonotoneX);

      const lineGroups = svg.selectAll(".line-group")
        .data(chartData)
        .join("g");

      lineGroups.append("path")
        .attr("fill", "none")
        .attr("stroke", d => d.color)
        .attr("stroke-width", 3)
        .attr("d", d => lineGen(d.values));

      lineGroups.selectAll("circle")
        .data(d => d.values)
        .join("circle")
        .attr("cx", d => xScale(d.stress))
        .attr("cy", d => yScale(d.sleep))
        .attr("r", 4)
        .attr("fill", (d, i, nodes) => d3.select(nodes[i].parentNode).datum().color);

      // legends
      const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 0)`);

      chartData.forEach((d, i) => {
        const legendRow = legend.append("g")
          .attr("transform", `translate(0, ${i * 25})`);

        legendRow.append("rect")
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", d.color);

        legendRow.append("text")
          .attr("x", 20)
          .attr("y", 12)
          .style("font-size", "13px")
          .text(d.id);
      });

      // point focusing
      const focus = svg.append("g").style("display", "none");
      focus.append("circle")
        .attr("r", 6)
        .attr("fill", "white")
        .style("stroke", "#333")
        .style("stroke-width", 2);
      
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", () => focus.style("display", null))
        .on("mouseout", () => {
            focus.style("display", "none");
            this.setState({ tooltip: { ...this.state.tooltip, visible: false } });
        })
        .on("mousemove", (event) => {
            const [mouseX, mouseY] = d3.pointer(event);
            const xVal = xScale.invert(mouseX);
            
            let closestPoint = null;
            let minDistance = Infinity;

            let activeId = "";
            let activeColor = "";

            chartData.forEach(series => {
                // finds which stress value is closer to coords of cursor
                const bisect = d3.bisector(d => d.stress).left;
                const i = bisect(series.values, xVal, 1);
                const d0 = series.values[i - 1];
                const d1 = series.values[i];
                
                if (!d0 || !d1) return;
                
                const d = xVal - d0.stress > d1.stress - xVal ? d1 : d0;
                
                // gets distance from mouse to this point (euclidean)
                const dx = xScale(d.stress) - mouseX;
                const dy = yScale(d.sleep) - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // checks and snaps to new nearest point
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPoint = d;
                    activeId = series.id;
                    activeColor = series.color;
                }
            });

            if (closestPoint && minDistance < 40) {
                focus.attr("transform", `translate(${xScale(closestPoint.stress)},${yScale(closestPoint.sleep)})`)
                     .style("display", null)
                     .select("circle").style("stroke", activeColor);

                this.setState({
                    tooltip: {
                        visible: true,
                        x: event.clientX,
                        y: event.clientY,
                        stress: closestPoint.stress,
                        sleep: closestPoint.sleep.toFixed(2),
                        count: closestPoint.count,
                        id: activeId,
                        color: activeColor
                    }
                });
            } else {
                focus.style("display", "none");
                this.setState({ tooltip: { ...this.state.tooltip, visible: false } });
            }
        });

    }).catch(err => console.error("D3 Error:", err));
  }

  render() {
    const { tooltip } = this.state;
    return (
      <div style={{ textAlign: "center", margin: "20px auto", maxWidth: "900px", fontFamily: "sans-serif" }}>
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", gap: "25px" }}>
          <label style={{ cursor: "pointer", fontSize: "14px" }}>
            <input 
              type="radio" 
              checked={this.state.viewMode === "compare"} 
              onChange={() => this.setState({ viewMode: "compare" })} 
            /> Compare Gender
          </label>
          <label style={{ cursor: "pointer", fontSize: "14px" }}>
            <input 
              type="radio" 
              checked={this.state.viewMode === "aggregate"} 
              onChange={() => this.setState({ viewMode: "aggregate" })} 
            /> Aggregate (Total)
          </label>
        </div>

        <div style={{ position: "relative", display: "inline-block" }}>
            <svg ref={this.svgRef}></svg>

            {tooltip.visible && (
                <div style={{
                    position: "fixed",
                    left: tooltip.x + 15,
                    top: tooltip.y - 40,
                    backgroundColor: "rgba(30, 30, 30, 0.95)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "4px",
                    pointerEvents: "none",
                    fontSize: "12px",
                    zIndex: 1000,
                    textAlign: "left",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                }}>
                <div style={{ borderBottom: "1px solid #666", marginBottom: "5px", paddingBottom: "3px", fontWeight: "bold", color: tooltip.color }}>
                    {tooltip.id}
                </div>
                <div>Stress Level: {tooltip.stress}</div>
                <div>Avg Sleep: {tooltip.sleep} hrs</div>
                <div style={{ fontSize: "11px", color: "#bbb", marginTop: "5px" }}>
                    Count: {tooltip.count}
                </div>
            </div>
            )}
        </div>
      </div>
    );
  }
}

export default StoryPoint2;