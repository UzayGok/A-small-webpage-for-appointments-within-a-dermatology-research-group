import React from "react";
import store from "../redux/store";
import { logoutUser } from "../redux/actions/userActions";

import Button from "@material-ui/core/Button";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import axios from "axios";

import { connect } from "react-redux";
import PropTypes from "prop-types";

class request extends React.Component {
  constructor(props) {
    super(props);

    this.props = props;
  }
  componentDidMount() {
    if (!localStorage.FBIdToken) {
      store.dispatch(logoutUser());
      this.props.history.push("/login");
    }
  }
  render() {
    return (
      <div className="meetinginfo">
        <h1>
          {" "}
          <u>{"Appointment request with the id"}</u>{" "}
          {": " + this.props.location.request.id}
        </h1>
        <p>
          <u>{"Created by"}</u> {": " + this.props.location.request.createdBy}
        </p>
        <p>
          <u>{"Title"}</u> {": " + this.props.location.request.Title}
        </p>
        <p>
          {" "}
          <u>{"Would be held by"}</u>{" "}
          {": " + this.props.location.request.chef}
        </p>
        <p>
          {" "}
          <u>{"Designated participants"}</u>{" "}
          {": " + this.props.location.request.parts}
        </p>
        <p>
          {" "}
          <u>{"Yet to be accepted by"}</u>{" "}
          {": " + this.props.location.request.stillwaiting}
        </p>
        <p>
          {" "}
          <u>{"Content"}</u> {": " + this.props.location.request.content}
        </p>
        <p>
          <u>{"Timespan"}</u>{" "}
          {": " +
            this.props.location.request.start.format(" |DD.MM.YYYY, HH:mm|") +
            "  till  |" +
            this.props.location.request.end.format("DD.MM.YYYY, HH:mm|")}
        </p>
        <Button
          edge="start"
          color="primary"
          onClick={() => {
            axios
              .post("/confirmdate", {
                id: this.props.location.request.id,
                action: "confirm",
              })
              .then(() => {
                window.location.href = "/";
              })
              .catch((err) => {
                console.log(err);
              });
          }}
        >
          <CheckIcon /> Confirm
        </Button>
        <Button
          edge="start"
          color="secondary"
          onClick={() => {
            axios
              .post("/confirmdate", {
                id: this.props.location.request.id,
                action: "reject",
              })
              .then(() => {
                window.location.href = "/";
              })
              .catch((err) => {
                console.log(err);
              });
          }}
        >
          <CloseIcon /> Reject
        </Button>
      </div>
    );
  }
}

request.propTypes = {
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapActionsToProps = {
  //todo
};

export default connect(mapStateToProps, mapActionsToProps)(request);
