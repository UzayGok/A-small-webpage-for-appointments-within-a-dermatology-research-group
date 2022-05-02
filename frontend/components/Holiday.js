import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import store from "../redux/store";
import { SET_ERRORS, CLEAR_ERRORS, LOADING_UI } from "../redux/types";
import axios from "axios";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,

  KeyboardDatePicker,
} from "@material-ui/pickers";
import Grid from "@material-ui/core/Grid";
import moment from "moment";

const styles = {
  form: {
    textAlign: "center",
  },
  pageTitle: { margin: "0px auto 8px auto", color: "#404040" },
  textField: { margin: "5x auto 5px auto" },
  button: { marginTop: "20px", position: "relative" },
  customSuccess: {
    color: "green",
    fontSize: "0.85rem",
    marginTop: "5px",
  },
  progress: {
    position: "absolute",
  },
  customError: {
    color: "red",
    fontSize: "0.85rem",
    marginTop: "5px",
  },
};

class Holiday extends React.Component {
  constructor() {
    super();
    this.state = {
      username: "",
      errors: null,
      success: "",
      start: Date.now(),
      end: Date.now(),
      timerror: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.UI.errors) {
      this.setState({ errors: nextProps.UI.errors });
    } else {
      this.setState({ errors: null });
    }
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  async axiosstuff(newDate) {
    axios
      .post("/termin", newDate)
      .then((res) => {
        console.log(res.data);
        this.setState({ success: res.data });
        store.dispatch({ type: CLEAR_ERRORS });
      })
      .catch((err) => {
        store.dispatch({
          type: SET_ERRORS,
          payload: err.response.data,
        });
        this.setState({ success: "" });
        console.log(newDate);
      });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    store.dispatch({ type: LOADING_UI });
    let start = moment(this.state.start);
    let end = moment(this.state.end);
    let fori = end.diff(start, "days");

    for (let i = 0; i <= fori; i++) {
      const newDate = {
        EndsAt: start.format("DD.MM.yyyy 23:59"),
        StartsAt: start.format("DD.MM.yyyy 00:00"),
        Title: "Holiday",
        chef: this.props.user.handle,
        content: "Away from work",
        parts: [this.props.user.handle],
        awaitingid: "",
      };

      this.axiosstuff(newDate);

      start.add(1, "days");
    }
  };
  render() {
    const {
      classes,
      UI: { loading },
    } = this.props;


    const handleStartChange = (date) => {
      if (date > this.state.end) {
        this.setState({ timerror: true, start: date });
      } else {
        this.setState({ timerror: false, start: date });
      }
    };

    const handleEndChange = (date) => {
      if (this.state.start > date) {
        this.setState({ timerror: true, end: date });
      } else {
        this.setState({ timerror: false, end: date });
      }
    };

    let timerror = this.state.timerror ? (
      <Typography variant="body2" className={classes.customError}>
        The holiday must end after it begins.
      </Typography>
    ) : (
      <p></p>
    );
    return (
      <form noValidate onSubmit={this.handleSubmit}>
        <Typography variant="h5" className="pageTitle">
          Check out for holiday:
        </Typography>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              {" "}
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="dd.MM.yyyy"
                margin="normal"
                id="start"
                name="start"
                label="Start"
                value={this.state.start}
                onChange={handleStartChange}
                disablePast
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="dd.MM.yyyy"
                margin="normal"
                name="end"
                id="end"
                label="End"
                value={this.state.end}
                onChange={handleEndChange}
                disablePast
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.button}
          disabled={loading || this.state.timerror}
        >
          Submit
          {loading && (
            <CircularProgress size={25} className={classes.progress} />
          )}
        </Button>
        {timerror}
      </form>
    );
  }
}

Holiday.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  UI: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
  UI: state.UI,
});

const mapActionsToProps = {
  //empty
};
export default connect(
  mapStateToProps,
  mapActionsToProps
)(withStyles(styles)(Holiday));
