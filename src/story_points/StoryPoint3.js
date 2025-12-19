import React, { Component } from "react";
import * as d3 from "d3";
import csvUrl from "../Sleep_health_and_lifestyle_dataset.csv";

class StoryPoint3 extends Component {
  constructor(props) {
    super(props);

    this.svgRef = React.createRef();
    this.containerRef = React.createRef();

    this.rawData = null;

    this.state = {
      minSampleSize: 1,
      tooltip: {
        visible: false,
        job: "",
        count: 0,
        A_sleep: 0,
        A_stress: 0,
        x: 0,
        y: 0,
      },
    };
  }

  componentDidMount() {
    const dataPromise = this.props.data
      ? Promise.resolve(this.props.data)
      : d3.csv(csvUrl);

    dataPromise
      .then((data) => {
        this.rawData = data;
        this.renderChart();
      })
      .catch((err) => console.error("Error", err));
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.minSampleSize !== this.state.minSampleSize) {
      this.renderChart();
    }
  }

  toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  buildOccupationStats = (rows) => {
    const byOcc = d3.group(rows, (d) => (d["Occupation"] || "Unknown").trim());

    return Array.from(byOcc, ([occ, people]) => {
      const ids = people
        .map((p) => (p["Person ID"] ?? p["PersonID"] ?? "").toString().trim())
        .filter((id) => id.length > 0);

      const count = ids.length > 0 ? new Set(ids).size : people.length;

      const sleepVals = people
        .map((p) => this.toNum(p["Quality of Sleep"]))
        .filter((x) => x !== null);

      const stressVals = people
        .map((p) => this.toNum(p["Stress Level"]))
        .filter((x) => x !== null);

      return {
        name: occ,
        count,
        A_sleep: sleepVals.length ? d3.mean(sleepVals) : null,
        A_stress: stressVals.length ? d3.mean(stressVals) : null,
      };
    });
  };

  renderChart = () => {
    if (!this.rawData) return;

    const { minSampleSize } = this.state;

    const occStats = this.buildOccupationStats(this.rawData)
      .filter((d) => d.count >= minSampleSize)
      .sort((a, b) => b.count - a.count);

    const hierarchyData = {
      name: "Occupations",
      children: occStats.map((d) => ({
        name: d.name,
        value: d.count,
        A_sleep: d.A_sleep,
        A_stress: d.A_stress,
      })),
    };

    const width = 900;
    const height = 520;

    const root = d3
      .hierarchy(hierarchyData)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    const treemap = d3
      .treemap()
      .size([width, height])
      .paddingInner(4)
      .paddingOuter(6);

    treemap(root);

    const color = d3
      .scaleThreshold()
      .domain([5.5, 6.5, 7.0, 7.5, 8.0, 8.5])
      .range([
        "#edf8e9", // <= 5.5
        "#c7e9c0", // 5.5–6.5
        "#a1d99b", // 6.5–7.0
        "#74c476", // 7.0–7.5
        "#41ab5d", // 7.5–8.0
        "#238b45", // 8.0–8.5
        "#005a32", // > 8.5
      ]);

    const svgEl = this.svgRef.current;
    const svg = d3.select(svgEl);

    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    const g = svg.append("g");
    const leaves = root.leaves();

    const cell = g
      .selectAll("g")
      .data(leaves)
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    cell
      .append("rect")
      .attr("width", (d) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d) => Math.max(0, d.y1 - d.y0))
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", (d) =>
        d.data.A_sleep == null ? "#E0E0E0" : color(d.data.A_sleep)
      )
      .style("stroke", "#fff")
      .style("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        const [mouseX, mouseY] = d3.pointer(event, svgEl);

        this.setState({
          tooltip: {
            visible: true,
            job: d.data.name,
            count: d.data.value,
            A_sleep: d.data.A_sleep,
            A_stress: d.data.A_stress,
            x: mouseX,
            y: mouseY,
          },
        });

        d3.select(event.currentTarget).style("opacity", 0.75);
      })
      .on("mousemove", (event) => {
        const [mouseX, mouseY] = d3.pointer(event, svgEl);
        this.setState((prev) => ({
          tooltip: { ...prev.tooltip, x: mouseX, y: mouseY },
        }));
      })
      .on("mouseout", (event) => {
        this.setState((prev) => ({
          tooltip: { ...prev.tooltip, visible: false },
        }));
        d3.select(event.currentTarget).style("opacity", 1);
      });

    cell
      .append("text")
      .attr("x", 10)
      .attr("y", 22)
      .attr("fill", "#0B2E13")
      .attr("font-size", "13px")
      .attr("font-weight", "bold")
      .attr("pointer-events", "none")
      .text((d) => d.data.name)
      .each(function (d) {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        if (w < 140 || h < 45) d3.select(this).remove();
      });

    cell
      .append("text")
      .attr("x", 10)
      .attr("y", 42)
      .attr("fill", "#1f3b24")
      .attr("font-size", "12px")
      .attr("pointer-events", "none")
      .text((d) => `n=${d.data.value}`)
      .each(function (d) {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        if (w < 140 || h < 60) d3.select(this).remove();
      });
  };

  render() {
    const { tooltip, minSampleSize } = this.state;

    return (
      <div
        ref={this.containerRef}
        style={{ position: "relative", width: "fit-content", margin: "0 auto" }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label style={{ fontWeight: "bold" }}>
            Min size sample:
            <select
              value={minSampleSize}
              onChange={(e) =>
                this.setState({ minSampleSize: Number(e.target.value) })
              }
              style={{ marginLeft: "8px", padding: "6px" }}
            >
              <option value={1}>Show All</option>
              <option value={3}>Hide jobs with &lt; 3 people</option>
              <option value={5}>Hide jobs with &lt; 5 people</option>
              <option value={10}>Hide jobs with &lt; 10 people</option>
            </select>
          </label>

          <span style={{ fontSize: "12px", color: "#555" }}>
            Size = Count of People, Color = Avg Sleep Quality
          </span>
        </div>

        <svg ref={this.svgRef} className="occupation-treemap"></svg>

        {tooltip.visible && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(15px, -50%)",
              backgroundColor: "rgba(0,0,0,0.85)",
              color: "#fff",
              padding: "10px",
              borderRadius: "6px",
              pointerEvents: "none",
              fontSize: "13px",
              zIndex: 10,
              whiteSpace: "nowrap",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
              {tooltip.job}
            </div>
            <div>Count: {tooltip.count}</div>
            <div>
              Average Sleep Quality:{" "}
              {tooltip.A_sleep == null ? "N/A" : tooltip.A_sleep.toFixed(2)}
            </div>
            <div>
              Average Stress Level:{" "}
              {tooltip.A_stress == null ? "N/A" : tooltip.A_stress.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default StoryPoint3;
