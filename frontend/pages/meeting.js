import React, { Component } from "react";
import store from "../redux/store";
import { logoutUser } from "../redux/actions/userActions";

class Meeting extends Component {
  constructor(props) {
    super(props);

    this.props = props;
  }
  componentDidMount() {
    if(!localStorage.FBIdToken) {
      store.dispatch(logoutUser());
      this.props.history.push("/login");
    }}
  
  render() {
    return (
      <div className="meetinginfo">
        <h1>
          {" "}
          <u>{"Meeting with the id"}</u> {": " + this.props.location.date.id}
        </h1>
        <p>
          <u>{"Title"}</u> {": " + this.props.location.date.Title}
        </p>
        <p>
          {" "}
          <u>{"Held by"}</u> {": " + this.props.location.date.chef}
        </p>
        <p>
          {" "}
          <u>{"Participants"}</u> {": " + this.props.location.date.parts}
        </p>
        <p>
          {" "}
          <u>{"Content"}</u> {": " + this.props.location.date.content}
        </p>
        <p>
          <u>{"Timespan"}</u>{" "}
          {": " +
            this.props.location.date.start.format(" |DD.MM.YYYY, HH:mm|") +
            "  till  |" +
            this.props.location.date.end.format("DD.MM.YYYY, HH:mm|")}
        </p>
      </div>
    );
  }
}

export default Meeting;
