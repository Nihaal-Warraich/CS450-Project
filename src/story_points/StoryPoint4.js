import React, { Component } from "react";
import * as d3 from "d3";
import csvUrl from "../Sleep_health_and_lifestyle_dataset.csv";

class StoryPoint4 extends Component {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
    this.containerRef = React.createRef(); // Ref for the wrapper div
    
    this.state = {
      tooltip: {
        visible: false,
        name: "",
        count: 0,
        percentage: 0,
        parentName: "",
        x: 0,
        y: 0
      }
    };
  }

  componentDidMount() {
    const dataPromise = this.props.data ? Promise.resolve(this.props.data) : d3.csv(csvUrl);

    dataPromise.then(rawData => {
      const normalizeBMI = (bmi) => (bmi === "Normal Weight" ? "Normal" : bmi);
      const normalizeDisorder = (disorder) => (disorder === "None" || !disorder ? "Healthy" : disorder);

      const groups = d3.group(rawData, d => normalizeBMI(d['BMI Category']), d => normalizeDisorder(d['Sleep Disorder']));

      const hierarchyData = {
        name: "Total",
        children: Array.from(groups, ([key, value]) => ({
          name: key,
          children: Array.from(value, ([subKey, subValue]) => ({
            name: subKey,
            value: subValue.length 
          }))
        }))
      };

      const width = 600;
      const height = 600;
      const radius = Math.min(width, height) / 2;

      const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

      const partition = d3.partition().size([2 * Math.PI, radius]);
      partition(root);

      const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1 - 1);

      const svgEl = this.svgRef.current;
      const svgSelection = d3.select(svgEl);

      svgSelection.attr("width", width).attr("height", height);
      svgSelection.selectAll("*").remove();

      const g = svgSelection
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      const color = d3.scaleOrdinal()
        .domain(["Normal", "Overweight", "Obese", "Healthy", "Insomnia", "Sleep Apnea"])
        .range(["#66BB6A", "#FFA726", "#EF5350", "#E0E0E0", "#AB47BC", "#5C6BC0"]);

      // Draw Paths
      g.selectAll("path")
        .data(root.descendants().filter(d => d.depth))
        .join("path")
        .attr("fill", d => color(d.data.name))
        .attr("d", arc)
        .style("stroke", "#fff")
        .style("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => {
          // Calculate Percentage relative to Parent
          // If depth is 1 (Inner ring), parent is Root. If depth is 2 (Outer ring), parent is BMI category.
          const parentValue = d.parent ? d.parent.value : root.value;
          const pct = ((d.value / parentValue) * 100).toFixed(1);
          const pName = d.parent ? d.parent.data.name : "Total";

          // Calculate Position relative to the SVG container
          // d3.pointer returns [x, y] relative to the <g> center (0,0)
          // We need to shift it by width/2, height/2 to get coordinates relative to the SVG topleft
          const [mouseX, mouseY] = d3.pointer(event, svgEl);

          this.setState({
            tooltip: {
              visible: true,
              name: d.data.name,
              count: d.value,
              percentage: pct,
              parentName: pName,
              x: mouseX, 
              y: mouseY
            }
          });
          
          d3.select(event.currentTarget).style("opacity", 0.7);
        })
        .on("mousemove", (event) => {
           // Update position as mouse moves
           const [mouseX, mouseY] = d3.pointer(event, svgEl);
           this.setState(prevState => ({
            tooltip: {
              ...prevState.tooltip,
              x: mouseX,
              y: mouseY
            }
           }));
        })
        .on("mouseout", (event) => {
          this.setState({
            tooltip: { ...this.state.tooltip, visible: false }
          });
          d3.select(event.currentTarget).style("opacity", 1);
        });

      // Labels
      g.selectAll("text")
        .data(root.descendants().filter(d => d.depth && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
        .join("text")
        .attr("transform", function(d) {
          const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
          const y = (d.y0 + d.y1) / 2;
          return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", d => d.depth === 1 ? "white" : "#333")
        .attr("font-size", "11px")
        .attr("pointer-events", "none")
        .text(d => d.data.name);

      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#555")
        .text("BMI Profile");

    }).catch(err => {
      console.error('Error loading CSV for StoryPoint4:', err);
    });
  }

  render() {
    const { tooltip } = this.state;

    return (
      // Added relative positioning to this container so the tooltip absolute position works correctly
      <div ref={this.containerRef} style={{ position: "relative", width: "fit-content", margin: "0 auto" }}>
        <svg ref={this.svgRef} className="bmi-sunburst"></svg>
        
        {tooltip.visible && (
          <div style={{
            position: "absolute",
            // Use the coordinates directly from state which are relative to the SVG
            left: tooltip.x, 
            top: tooltip.y,
            transform: "translate(15px, -50%)", // Shift slightly right and center vertically on cursor
            backgroundColor: "rgba(0,0,0,0.85)",
            color: "#fff",
            padding: "10px",
            borderRadius: "6px",
            pointerEvents: "none",
            fontSize: "13px",
            zIndex: 10,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{tooltip.name}</div>
            <div>Count: {tooltip.count}</div>
            <div style={{ fontSize: "11px", color: "#ddd" }}>
              {tooltip.percentage}% of {tooltip.parentName}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default StoryPoint4;