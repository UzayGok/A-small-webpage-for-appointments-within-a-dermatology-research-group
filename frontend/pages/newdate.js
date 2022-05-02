import React from "react";
import store from "../redux/store";
import { logoutUser } from "../redux/actions/userActions";
import moment from "moment";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import { SET_ERRORS, CLEAR_ERRORS, LOADING_UI } from "../redux/types";
import axios from "axios";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

import ListItemText from "@material-ui/core/ListItemText";

import CalendarUser from "../components/CalendarUser";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";


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
  customError: {
    color: "red",
    fontSize: "0.85rem",
    marginTop: "5px",
  },
  progress: {
    position: "absolute",
  },
  root: {
    width: "100%",
    maxWidth: 360,
  },
  listbox: {},
};

const datestomoms = (dates) => {
  let result = [];
  dates.forEach((date) => {
    result.push({
      start: moment(date.start, "DD.MM.YYYY hh:mm"),
      end: moment(date.end, "DD-MM-YYYY hh:mm"),
      Title: date.part,
    });
  });
  return result;
};
const periodstostring = (periods) => {
  let bool = false;
  let temp = "";
  if (periods.length < 2) return temp;
  periods.forEach((period) => {
    if (!bool) {
      temp += "from " + period.day + " " + period.hour + ":" + period.minute;
    } else if (bool) {
      temp +=
        " to " + period.day + " " + period.hour + ":" + period.minute + "; ";
    }
    bool = !bool;
  });
  return temp;
};

class newdate extends React.Component {
  constructor() {
    super();
    this.state = {
      title: "",
      content: "",
      errors: null,
     
      hosts: [],
      userDates: [],
      selectedDate: Date.now(),
      selectedHosts: [],
      periods: [],
      calendar: false,
      start: Date.parse("17 Aug 2020 08:30:00 UTC+2"),
      end: Date.parse("17 Aug 2020 17:30:00 UTC+2"),
      chef: "",
      chefrror: false,
      showtemp: false,
      temps: [],
      selectedTemps: [],
      success: false,
      error: false,
      errormsg: "",
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.UI.errors) {
      this.setState({ errors: nextProps.UI.errors });
    } else {
      this.setState({ errors: null });
    }
  }

  async axiosstuff(host) {
    axios({
      method: "post",
      url: "/period",

      data: {
        user: host,
      },
    }).then((dataa) => {
      let period = this.state.periods;
      period.push(host + " is available " + periodstostring(dataa.data));

      this.setState({ periods: period.sort() });
    });
  }
  componentDidMount() {
    if (!localStorage.FBIdToken) {
      store.dispatch(logoutUser());
      this.props.history.push("/login");
    }
    this.setState({ hosts: [], periods: [] });
    this.setState({ hosts: [], periods: [] });
    axios.get("/hosts").then((array) => {
      let sorted = [];
      array.data.forEach((userr) => {
        if (userr !== this.props.user.handle) sorted.push(userr);
      });
      sorted.sort();
      this.setState({ hosts: sorted });

      this.state.hosts.forEach((host) => {
        this.axiosstuff(host);
      });
    });
    axios.get("/tempacc").then((array) => {
      let sorted = [];
      array.data.forEach((userr) => {
        if (userr !== this.props.user.handle) sorted.push(userr);
      });
      sorted.sort();

      this.setState({ temps: sorted });
    });
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  showCal = (userr) => {
    this.setState({ calendar: true });
    if (userr === this.state.chef) this.setState({ chefrror: false });
    axios({
      method: "post",
      url: "/onesdates",

      data: {
        user: userr,
      },
    }).then((array) => {
      if (!this.state.userDates) {
        this.setState({ userDates: datestomoms(array.data) });
      } else {
        let array2 = this.state.userDates;
        let forray = this.state.selectedHosts;
        let checked = false;
        forray.forEach((element) => {
          if (element === userr) checked = true;
        });
        if (!checked) {
          let array3 = array2.concat(datestomoms(array.data));

          let temp = this.state.selectedHosts;
          temp.push(userr);
          this.setState({ userDates: array3, selectedHosts: temp });
        } else {
          this.hideCal(userr);
        }
      }
    });
  };

  handleTemp = (user) => {
    let seltemps = this.state.selectedTemps;
    let bool = false;
    let seltemps2 = [];
    seltemps.forEach((temp) => {
      if (temp === user) bool = true;
      else seltemps2.push(temp);
    });
    if (!bool) {
      seltemps.push(user);
      this.setState({ selectedTemps: seltemps });
    } else {
      this.setState({ selectedTemps: seltemps2 });
    }
  };

  hideCal = (userr) => {
    let array = this.state.userDates;
    let array2 = [];
    if (userr === this.state.chef) this.setState({ chefrror: true, chef: "" });

    array.forEach((entry) => {
      if (entry.Title !== userr) array2.push(entry);
    });

    let temp = this.state.selectedHosts;
    let temp2 = [];

    temp.forEach((entry) => {
      if (entry !== userr) temp2.push(entry);
    });

    this.setState({ userDates: array2, selectedHosts: temp2 });
  };

  setSelected = (user) => {
    this.state.selectedHosts.forEach((host) => {
      if (host === user) return true;
    });
    return false;
  };

  handleChef = (user) => {
    let bool = false;
    if (this.state.chef !== user) {
      this.state.selectedHosts.forEach((host) => {
        if (host === user) bool = true;
      });
      if (!bool) this.setState({ chefrror: true });
      else {
        this.setState({ chefrror: false, chef: user });
      }
    }
    if (this.state.chef === user) {
      this.setState({ chefrror: false, chef: "" });
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();

    let array = this.state.selectedHosts.concat(this.state.selectedTemps);
    array.push(this.props.user.handle);
    if (this.state.selectedHosts.length < 1 && !this.props.user.con2) {
      this.setState({
        error: true,
        errormsg: "You must select at least one host.",
      });
      return;
    }
    if (this.state.chef === "" && !this.props.user.con2) {
      this.setState({ error: true, errormsg: "You must select a superior." });
      return;
    } else if (this.state.chef === "") {
      this.setState({ chef: this.props.user.handle });
    }

    const newRequest = {
      EndsAt:
        moment(this.state.selectedDate).format("DD.MM.YYYY") +
        moment(this.state.end).format(" HH:mm"),
      StartsAt:
        moment(this.state.selectedDate).format("DD.MM.YYYY") +
        moment(this.state.start).format(" HH:mm"),
      Title: this.state.title,
      chef: this.state.chef,
      content: this.state.content,
      directedto: array,
      stillwaiting: this.state.selectedHosts,
    };
    store.dispatch({ type: LOADING_UI });
    axios
      .post("/request", newRequest)
      .then(() => {
        store.dispatch({ type: CLEAR_ERRORS });
        this.setState({ success: true, error: false, errormsg: "" });
   
        
      })
      .catch((err) => {
        store.dispatch({
          type: SET_ERRORS,
          payload: err.response.data,
        });
        this.setState({ success: false, error: true, errormsg: err.error });
     
      });
  };

  render() {
    const handleDateChange = (date) => {
      this.setState({ selectedDate: date });
    };

    const handleStartChange = (date) => {
      this.setState({ start: date });
    };

    const handleEndChange = (date) => {
      this.setState({ end: date });
    };

    const {
      classes,
      UI: { loading },
    } = this.props;
    const {  hosts, temps } = this.state;
    let calendar =
      this.state.selectedHosts.length !== 0 && this.state.calendar ? (
        <div>
          <p>Occupied hours</p>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              this.setState({ calendar: false });
            }}
          >
            hide
          </Button>
          <br />
          <CalendarUser
            firstday={moment(this.state.selectedDate).startOf("isoWeek")}
            inter={this.state.userDates}
          />
          <br />
        </div>
      ) : (
        <p> </p>
      );
    let chefrror = this.state.chefrror ? (
      <Typography variant="body2" className={classes.customError}>
        The superior must be one of the participants.
      </Typography>
    ) : (
      <p></p>
    );

    let resultt = this.state.success ? (
      <Typography variant="body2" className={classes.customSuccess}>
        Appointment request created successfully.
      </Typography>
    ) : this.state.error ? (
      <Typography variant="body2" className={classes.customError}>
        Appointment request could not be created. <br />
        {this.state.errormsg}
      </Typography>
    ) : (
      <p />
    );
    let templist = this.state.showtemp ? (
      <Grid container>
        <Grid item xs={6}>
          <div>
            <List dense className={styles.listbox}>
              {temps.map((value) => {
                let sel = false;
                this.state.selectedTemps.forEach((host) => {
                  if (host === value) sel = true;
                });

                return (
                  <ListItem
                    key={value}
                    button
                    onClick={() => {
                      this.handleTemp(value);
                    }}
                    selected={sel}
                  >
                    <ListItemText id={value + "item"} primary={value} />
                  </ListItem>
                );
              })}
            </List>
          </div>
        </Grid>
      </Grid>
    ) : (
      <p></p>
    );
    let counter = -1;

    return (
      <div className="newdate">
        <Grid container direction="column" alignItems="flex-start" spacing={1}>
          <Typography variant="h5" className="pageTitle">
            New meeting:
          </Typography>
          <TextField
            id="title"
            name="title"
            type="title"
            label="Title"
            className={classes.textField}
            value={this.state.title}
            onChange={this.handleChange}
            fullWidth
          />
          <TextField
            id="content"
            name="content"
            type="content"
            label="Content"
            className={classes.textField}
            value={this.state.content}
            onChange={this.handleChange}
            fullWidth
            multiline={true}
          />
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="dd.MM.yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Date"
              value={this.state.selectedDate}
              onChange={handleDateChange}
              disablePast
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                {" "}
                <KeyboardTimePicker
                  margin="normal"
                  id="time-picker"
                  label="Starts at"
                  ampm={false}
                  minutesStep={30}
                  autoOk={true}
                  value={this.state.start}
                  onChange={handleStartChange}
                  variant="inline"
                  KeyboardButtonProps={{
                    "aria-label": "change time",
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <KeyboardTimePicker
                  margin="normal"
                  id="time-picker2"
                  label="Ends at"
                  ampm={false}
                  autoOk={true}
                  value={this.state.end}
                  onChange={handleEndChange}
                  minutesStep={30}
                  variant="inline"
                  KeyboardButtonProps={{
                    "aria-label": "change time",
                  }}
                />
              </Grid>
            </Grid>
          </MuiPickersUtilsProvider>
          <br></br>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              {"Select the hosts that will participate: "}
              <List dense className={styles.listbox}>
                {hosts.map((value) => {
                  counter++;
                  let sel = false;
                  this.state.selectedHosts.forEach((host) => {
                    if (host === value) sel = true;
                  });
                  return (
                    <div>
                      <ListItem
                        key={value}
                        button
                        onClick={() => {
                          this.showCal(value);
                        }}
                        selected={sel}
                      >
                        <ListItemText id={value + "item"} primary={value} />
                      </ListItem>
                      <p className="available">
                        {" "}
                        {this.state.periods[counter]}
                      </p>
                    </div>
                  );
                })}
              </List>
            </Grid>
            <Grid item xs={6}>
              {"Select the superior: "}
              <List dense className={styles.listbox}>
                {hosts.map((value) => {
                  return (
                    <div>
                      <ListItem
                        key={value}
                        button
                        onClick={() => {
                          this.handleChef(value);
                        }}
                        selected={value === this.state.chef}
                      >
                        <ListItemText id={value + "item"} primary={value} />
                      </ListItem>
                      <p className="available">
                        {" "}
                        {value +
                          " is a host and is eligible to lead a meeting."}
                      </p>
                    </div>
                  );
                })}{" "}
                {chefrror}
              </List>
            </Grid>{" "}
          </Grid>
          {calendar}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              this.setState({ showtemp: !this.state.showtemp });
            }}
          >
            Show / Hide Guest Accounts List
          </Button>

          {templist}
          <br />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
            disabled={loading}
            onClick={this.handleSubmit}
          >
            Submit
            {loading && (
              <CircularProgress size={25} className={classes.progress} />
            )}
          </Button>
          {resultt}
        </Grid>
      </div>
    );
  }
}

newdate.propTypes = {
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
)(withStyles(styles)(newdate));
