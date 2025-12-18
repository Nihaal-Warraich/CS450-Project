import React, { Component } from "react";
import * as d3 from "d3";
import csvUrl from "../Sleep_health_and_lifestyle_dataset.csv";

class StoryPoint1 extends Component {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
    this.state = {
      showLine: true,
      tooltip: {
        visible: false,
        text: "",
        x: 0,
        y: 0
      }
    };
  }

  componentDidMount() {
    d3.csv(csvUrl).then(data => this.drawChart(data));
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.showLine !== this.state.showLine) {
      d3.csv(csvUrl).then(data => this.drawChart(data));
    }
  }

  drawChart(rawData) {
    const svg = d3.select(this.svgRef.current);
    svg.selectAll("*").remove();

    const width = 720;
    const height = 450;
    const margin = { top: 80, right: 100, bottom: 90, left: 100 };

    const data = rawData.map(d => ({
      quality: +d["Quality of Sleep"],
      disorder: d["Sleep Disorder"] || "None",
      duration: +d["Sleep Duration"]
    }));

    const xDomain = d3.range(1, 11);
    const grouped = d3.group(data, d => d.quality);

    const processed = xDomain.map(q => {
      const values = grouped.get(q) || [];
      return {
        quality: q,
        None: values.filter(d => d.disorder === "None").length,
        Insomnia: values.filter(d => d.disorder === "Insomnia").length,
        "Sleep Apnea": values.filter(d => d.disorder === "Sleep Apnea").length,
        avgDuration: values.length ? d3.mean(values, d => d.duration) : null
      };
    });

    const disorders = ["None", "Insomnia", "Sleep Apnea"];
    const colors = {
      None: "#bdbdbd",
      Insomnia: "#7E57C2",
      "Sleep Apnea": "#e53935"
    };

    const x = d3.scaleBand()
      .domain(xDomain)
      .range([margin.left, width - margin.right])
      .padding(0.25);

    const yBars = d3.scaleLinear()
      .domain([0, d3.max(processed, d => d.None + d.Insomnia + d["Sleep Apnea"])])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const yLine = d3.scaleLinear()
      .domain([0, d3.max(processed, d => d.avgDuration || 0)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("max-width", "100%")
      .style("height", "auto");

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yBars));

    svg.append("g")
      .attr("transform", `translate(${width - margin.right},0)`)
      .call(d3.axisRight(yLine));

    svg.append("text")
      .attr("x", margin.left + (width - margin.left - margin.right) / 2)
      .attr("y", height - 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#222")
      .text("Quality of Sleep Score (1–10)");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + (height - margin.top - margin.bottom) / 2))
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#222")
      .text("Number of Individuals");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + (height - margin.top - margin.bottom) / 2))
      .attr("y", width - 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#222")
      .text("Average Sleep Duration (Hours)");

    const stack = d3.stack().keys(disorders);
    const stackedData = stack(processed);

    svg.append("g")
      .selectAll("g")
      .data(stackedData)
      .join("g")
      .attr("fill", d => colors[d.key])
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", d => x(d.data.quality))
      .attr("y", d => yBars(d[1]))
      .attr("height", d => yBars(d[0]) - yBars(d[1]))
      .attr("width", x.bandwidth())
      .on("mouseover", (event, d) => {
        const disorder = event.currentTarget.parentNode.__data__.key;
        this.setState({
          tooltip: {
            visible: true,
            text: `${d.data[disorder]} ${disorder} patients`,
            x: event.pageX,
            y: event.pageY
          }
        });
      })
      .on("mouseout", () => {
        this.setState({ tooltip: { ...this.state.tooltip, visible: false } });
      });

    if (this.state.showLine) {
      const line = d3.line()
        .defined(d => d.avgDuration !== null)
        .x(d => x(d.quality) + x.bandwidth() / 2)
        .y(d => yLine(d.avgDuration));

      svg.append("path")
        .datum(processed)
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-width", 3)
        .attr("d", line);

      svg.selectAll("circle")
        .data(processed.filter(d => d.avgDuration !== null))
        .join("circle")
        .attr("cx", d => x(d.quality) + x.bandwidth() / 2)
        .attr("cy", d => yLine(d.avgDuration))
        .attr("r", 4)
        .on("mouseover", (event, d) => {
          this.setState({
            tooltip: {
              visible: true,
              text: `Avg Sleep: ${d.avgDuration.toFixed(1)} hrs`,
              x: event.pageX,
              y: event.pageY
            }
          });
        })
        .on("mouseout", () => {
          this.setState({ tooltip: { ...this.state.tooltip, visible: false } });
        });
    }
  }

  render() {
    const { showLine, tooltip } = this.state;

    return (
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ marginBottom: "15px", marginLeft: "20px" }}>
          <label>
            <input
              type="checkbox"
              checked={showLine}
              onChange={() => this.setState({ showLine: !showLine })}
            />{" "}
            Show Sleep Duration Line
          </label>
        </div>

        <svg ref={this.svgRef}></svg>

        {tooltip.visible && (
          <div style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(10px, -30px)",
            background: "rgba(0,0,0,0.85)",
            color: "#fff",
            padding: "8px",
            borderRadius: "5px",
            fontSize: "12px",
            pointerEvents: "none"
          }}>
            {tooltip.text}
          </div>
        )}
      </div>
    );
  }
}

export default StoryPoint1;
