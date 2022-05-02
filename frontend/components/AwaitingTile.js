import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
const Link = require("react-router-dom").Link;

class AwaitingTile extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.ToMeet = {
      pathname: "/request",
      request: props.request,
    };
  }

  render() {
    return (
      <Link to={this.ToMeet} style={{ textDecoration: "none" }}>
        <Paper elevation={3}>
          <div className="awaitingTile" onClick={this.changeRoute}>
            <p>
              {this.props.request.start.format("DD.MM.YY") +
                ", " +
                this.props.request.start.format("HH:mm") +
                " - " +
                this.props.request.end.format("HH:mm")}
            </p>
            <p>{this.props.request.Title}</p>
            <p>
              <u>Created By: </u>
              {this.props.request.createdBy}
            </p>
          </div>
        </Paper>
      </Link>
    );
  }
}

export default AwaitingTile;
