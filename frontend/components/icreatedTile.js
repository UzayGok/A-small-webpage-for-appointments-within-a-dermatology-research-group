import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";

class icreatedTile extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    return (
      <Paper elevation={3}>
        <div className="icreatedthis" >
        <p>
            <u>{"Status"}</u>{" "}
            {": " +
              (this.props.request.rejected
                ? "REJECTED"
                : this.props.request.stillwaiting.length <=0
                ? "ACCEPTED"
                : "OPEN")}
          </p>
          <p>
            {" "}
            <u>{"id"}</u> {": " + this.props.request.id}
          </p>
          <p>
            {" "}
            <u>{"Title"}</u> {": " + this.props.request.Title}
          </p>
          <p>
            {" "}
            <u>{"Participants"}</u> {": " + this.props.request.directedto}
          </p>
          <p>
            <u>{"Superior"}</u> {": " + this.props.request.chef}
          </p>
          <p>
          <u>{"Timespan"}</u> {": " +this.props.request.StartsAt + " - " + this.props.request.EndsAt.split(" ")[1]}
          </p>
        
          <p>
            <u>{"Not yet responded"}</u>{" "}
            {": " + this.props.request.stillwaiting}</p>
            <p>  <u>{"Rejected by"}</u> {": " + this.props.request.rejectedby} </p>
          
        </div>
      </Paper>
    );
  }
}

export default icreatedTile;
