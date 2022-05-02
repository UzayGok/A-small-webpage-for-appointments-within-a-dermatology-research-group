import React, { Component } from "react";
import store from "../redux/store";
import { logoutUser } from "../redux/actions/userActions";
import moment from "moment";
import Grid from "@material-ui/core/Grid";

import { connect } from "react-redux";
import PropTypes from "prop-types";

import axios from "axios";

import Icreatedtile from "../components/icreatedTile";

function compare(a, b) {
  let amom= moment(a.StartsAt, "DD.MM.YYYY HH:mm")
  let bmom= moment(b.StartsAt, "DD.MM.YYYY HH:mm")

  if (amom < bmom) return 1;
  if (bmom < amom) return -1;

  return 0;
}


class icreated extends Component {
  state = {
    Block: [],
  };

  constructor(props) {
    super(props);

    this.props = props;
  }

  componentDidMount() {
    if (!localStorage.FBIdToken) {
      store.dispatch(logoutUser());
      this.props.history.push("/login");
    }
    axios.get("/icreated").then((array) => {
      let sorted=array.data;
    sorted.sort(compare);
      let temp = [];
      sorted.forEach((item) => {
        temp.push(<Icreatedtile request={item} />);
      });
      this.setState({ Block: temp });
      
    });
  }

  render() {
    const {
      Block
   } = this.state;
    return (
      <Grid container spacing={1}>
        <Grid item />
        <Grid
          container
          item
          direction="column"
          justify="flex-start"
          alignItems="center"
        > <div>{Block}</div></Grid>
       

        <Grid item />
      </Grid>
    );
  }
}

icreated.propTypes = {
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapActionsToProps = {
  //todo
};

export default connect(mapStateToProps, mapActionsToProps)(icreated);
