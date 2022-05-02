import React from "react";
import store from "../redux/store";
import { logoutUser } from "../redux/actions/userActions";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Guesttohost from "../components/guesttohost";
import Guestconfirm from "../components/guestconfirm";
import Demote from "../components/demote";
import Deactivate from "../components/deactivate";
import Updateperiod from "../components/updateperiod";
import Holiday from "../components/Holiday";

class settings extends React.Component {
  componentDidMount() {
    if (!localStorage.FBIdToken) {
      store.dispatch(logoutUser());
      this.props.history.push("/login");
    }
    if (!this.props.user.con2) {
      window.location.href = "/";
    }
  }
  render() {
    let inside = this.props.user.con2 ? (
      <div>
        <br /> <br />
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="flex-start"
          spacing={6}
        >
          <Grid item>
            <Guestconfirm />
          </Grid>
          <Grid item>
            <Guesttohost />
          </Grid>
          <Grid item>
            {" "}
            <Demote />{" "}
          </Grid>

          <Grid item>
            <Deactivate />{" "}
          </Grid>
          <Grid item>
            <Updateperiod />{" "}
          </Grid>
          <Grid item>
            <Holiday />{" "}
          </Grid>
        </Grid>
        </div>
    ) : (
      "You are not authorized."
    );
    return  (<div> {inside}  </div>)
  }
}

settings.propTypes = {
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

export default connect(mapStateToProps, mapActionsToProps)(settings);
