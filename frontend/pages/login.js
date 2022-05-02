import React, { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import PropTypes from "prop-types";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";

import { connect } from "react-redux";
import { loginUser } from "../redux/actions/userActions";

const Link = require("react-router-dom").Link;
const styles = {
  form: {
    textAlign: "center",
  },
  pageTitle: { margin: "0px auto 8px auto", color: "#404040" },
  textField: { margin: "5x auto 5px auto" },
  button: { marginTop: "20px", position: "relative" },
  customError: {
    color: "red",
    fontSize: "0.85rem",
    marginTop: "5px",
  },
  progress: {
    position: "absolute",
  },
};

class login extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",

      errors: {},
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.UI.errors) {
      this.setState({ errors: nextProps.UI.errors });
    }
  }
  handleSubmit = (event) => {
    event.preventDefault();

    const userData = {
      handle: this.state.username,
      password: this.state.password,
    };
    this.props.loginUser(userData, this.props.history);
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
      <Grid container className={classes.form}>
        <Grid item sm />
        <Grid item sm>
          <Typography variant="h5" className={classes.pageTitle}>
            Smart Calendar
          </Typography>
          <Typography variant="h2" className={classes.pageTitle}>
            Login
          </Typography>
          <form noValidate onSubmit={this.handleSubmit}>
            <TextField
              id="username"
              name="username"
              type="username"
              label="Username"
              className={classes.textField}
              helperText={errors.username}
              error={errors.username ? true : false}
              value={this.state.username}
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              id="password"
              name="password"
              type="password"
              label="Password"
              className={classes.textField}
              helperText={errors.password}
              error={errors.password ? true : false}
              value={this.state.password}
              onChange={this.handleChange}
              fullWidth
            />
            {errors.general && (
              <Typography variant="body2" className={classes.customError}>
                {errors.general}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={loading}
            >
              Log in
              {loading && (
                <CircularProgress size={25} className={classes.progress} />
              )}
            </Button>
            <br />
            <small>
              {" "}
              <Link
                to="/signup"
                style={{ textDecoration: "none", color: "gray" }}
              >
                To Signup Page
              </Link>{" "}
            </small>
          </form>
        </Grid>
        <Grid item sm />
      </Grid>
    );
  }
}

login.propTypes = {
  classes: PropTypes.object.isRequired,
  loginUser: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  UI: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
  UI: state.UI,
});

const mapActionsToProps = {
  loginUser,
};

export default connect(
  mapStateToProps,
  mapActionsToProps
)(withStyles(styles)(login));
