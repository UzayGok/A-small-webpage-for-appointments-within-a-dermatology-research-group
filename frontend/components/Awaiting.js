import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import AwaitingTile from "./AwaitingTile";
import Paper from "@material-ui/core/Paper";

class Awaiting extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    let Block = [];
    let header = ";";
    this.props.array.forEach((reqq) => {
      Block.push(<AwaitingTile request={reqq} />);
    });
    Block.length <= 0
      ? (header = "No appointment requests available")
      : (header = "Appointment requests");
    return (
      <Paper>
        <div className="awaiting">
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="center"
            spacing={1}
          >
            <h4>{header}</h4>
            {Block}
          </Grid>
        </div>
      </Paper>
    );
  }
}

export default Awaiting;
