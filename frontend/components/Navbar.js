import React, { Component } from "react";


//MaterialUI stuff
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import SettingsIcon from '@material-ui/icons/Settings';
import AddIcon from '@material-ui/icons/Add';

const Link = require("react-router-dom").Link;

class Navbar extends Component {
  render() {
    return (
      <AppBar position="fixed">
        <Toolbar className="nav-container">
        <Button edge="start" color="inherit" component={Link} to="/newdate">
            <AddIcon/>
          </Button>
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/signup">
            Signup
          </Button>
          <Button edge="start" color="inherit" component={Link} to="/settings">
            <SettingsIcon/>
          </Button>
        </Toolbar>
       
      </AppBar>
    );
  }
}

export default Navbar;
