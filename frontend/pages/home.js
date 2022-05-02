import React, { Component } from "react";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Calendar from "../components/Calendar";
import Awaiting from "../components/Awaiting";
import moment from "moment";
import Button from "@material-ui/core/Button";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import RefreshIcon from "@material-ui/icons/Refresh";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import store from "../redux/store";
import { logoutUser } from "../redux/actions/userActions";


const Link = require("react-router-dom").Link;

const datestomoms = (dates) => {
  let result = [];
  dates.forEach((date) => {
    result.push({
      start: moment(date.StartsAt, "DD.MM.YYYY hh:mm"),
      end: moment(date.EndsAt, "DD-MM-YYYY hh:mm"),
      Title: date.Title,
      content: date.content,
      id: date.id,
      parts: date.parties,
      chef: date.chef,
    });
  });
  return result;
};

const awaitingtomoms = (dates) => {
  let result = [];
  dates.forEach((date) => {
    result.push({
      start: moment(date.StartsAt, "DD.MM.YYYY hh:mm"),
      end: moment(date.EndsAt, "DD-MM-YYYY hh:mm"),
      Title: date.Title,
      content: date.content,
      id: date.id,
      parts: date.directedto,
      chef: date.chef,
      createdBy: date.createdBy,
      rejected: date.rejected,
      rejectedby: date.rejectedby,
      stillwaiting: date.stillwaiting,
    });
  });
  return result;
};

class home extends Component {
  state = {
    dates: null,
    firstda: moment().startOf("isoWeek"),
  };
  componentDidMount() { 
    if (!localStorage.FBIdToken) {
      store.dispatch(logoutUser());
     this.props.history.push("/login");
    }
    axios
      .get("/mydates")
      .then((res) => {
        this.setState({
          dates: datestomoms(res.data),
        });
      })
      .catch((err) => console.log(err));

    axios
      .get("/awaitingme")
      .then((res) => {
        this.setState({
          awaiting: awaitingtomoms(res.data),
        });
      })
      .catch((err) => console.log(err));
  }

  render() {
    let calendar = this.state.dates ? (
      <Calendar firstday={this.state.firstda} inter={this.state.dates} />
    ) : (
      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="small"
        onClick={() => {
          this.props.history.push("/login");
        }}
      >
        <RefreshIcon />
      </Button>
    );

    let awaiting = this.state.awaiting ? (
      <Awaiting array={this.state.awaiting} />
    ) : (
      <p>Awaiting login...</p>
    );

    let oldawaiting = (
      <p>
        Click <Link to={"/icreated"}>here</Link> to see your appointment
        requests.
      </p>
    );

    return (
      <Grid container spacing={1}>
        <Grid container item xs={12} spacing={3}>
          <Grid item sm={1} xs={2}></Grid>
          <Grid item sm={4} xs={6}>
            <p>
              {"Personal calendar of " +
                (typeof this.props.user.handle == "undefined"
                  ? ""
                  : this.props.user.handle)}
            </p>
          </Grid>
          <Grid item sm={4} xs={6}>
            Monday, the {this.state.firstda.format("DD.MM.YYYY") + "  "}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                this.setState({ firstda: this.state.firstda.add(-1, "week") });
              }}
            >
              <ChevronLeftIcon />
            </Button>{" "}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                this.setState({ firstda: this.state.firstda.add(1, "week") });
              }}
            >
              <ChevronRightIcon />
            </Button>
          </Grid>
        </Grid>
        <Grid container item xs={12} spacing={3}>
          <Grid item sm={9} xs={12}>
            {calendar}
          </Grid>
          <Grid item sm={3} xs={4}>
            {this.props.user.con2 ? awaiting : null}
            {oldawaiting}
            <div>
              <br />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                onClick={() => {
                  store.dispatch(logoutUser());

                  this.props.history.push("/login");
                }}
              >
                <PowerSettingsNewIcon />
                Logout
              </Button>
            </div>
          </Grid>
        </Grid>
        <Grid container item xs={12} spacing={3}>
          <Grid item />
          <Grid item />
          <Grid item> </Grid>
        </Grid>
      </Grid>
    );
  }
}

home.propTypes = {
  user: PropTypes.object.isRequired,
  UI: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
  UI: state.UI,
});

const mapActionsToProps = {
  //todo
};

export default connect(mapStateToProps, mapActionsToProps)(home);
