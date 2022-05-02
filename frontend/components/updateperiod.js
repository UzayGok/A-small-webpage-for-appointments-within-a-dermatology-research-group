import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import store from "../redux/store";
import { SET_ERRORS, CLEAR_ERRORS, LOADING_UI } from "../redux/types";
import axios from "axios";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";

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
};

class updateperiod extends React.Component {
  constructor() {
    super();
    this.state = {
      username: "",
      errors: null,
      success: "",
    };
  }


  handleSubmit = (event) => {
    event.preventDefault();
    let req = {
      period: this.state.username,
    };
    store.dispatch({ type: LOADING_UI });
    axios
      .post("/updateperiod", req)
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
        this.setState({ success: "", errors: ["Could not update period."] });
      });
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
      
    });
  
  };

  render() {
    const {
      classes,
      UI: { loading },
    } = this.props;
    const { errors } = this.state;

    return (
      <div className="setting">
        {" "}
        <form noValidate onSubmit={this.handleSubmit}>
        <Typography variant="h5" className="pageTitle">
          Update your time period:
              </Typography>
          <TextField
            id="username"
            name="username"
            type="username"
            label="example: MON09:30-TUE17:00;WED13:30-FRI08:30"
            className={classes.textField}
            helperText={errors? errors[0]: ""}
            error={errors ? true : false}
            value={this.state.username}
            onChange={this.handleChange}
            fullWidth
          /><Typography variant="body2" className={classes.customSuccess}>
          {this.state.success}
              </Typography>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
            disabled={loading}
          >
            submit{" "}
            {loading && (
              <CircularProgress size={25} className={classes.progress} />
            )}
          </Button> 
         
        </form>
      </div>
    );
  }
}

updateperiod.propTypes = {
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
)(withStyles(styles)(updateperiod));
