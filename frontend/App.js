import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import jwtDecode from "jwt-decode";
import AuthRoute from "./util/AuthRoute";

// Redux
import { Provider } from "react-redux";
import store from "./redux/store";
import { SET_AUTHENTICATED } from "./redux/types";
import { logoutUser, getUserData } from "./redux/actions/userActions";
//components
import Navbar from "./components/Navbar";
//pages
import home from "./pages/home";
import login from "./pages/login";
import signup from "./pages/signup";
import meeting from "./pages/meeting";
import newdate from "./pages/newdate";
import settings from "./pages/settings";
import request from "./pages/request";
import icreated from "./pages/icreated";
import axios from "axios";

const theme = createMuiTheme({
  palette: {
    primary: {
      light: "#33c9dc",
      main: "#00bcd4",
      dark: "#008394",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff6333",
      main: "#ff3d00",
      dark: "#b22a00",
      contrastText: "#fff",
    },
  },
  typography: {
    useNextVariants: true,
  },
});

axios.defaults.baseURL = "https://europe-west3-smart-calendar-2c8ce.cloudfunctions.net/api";

const token = localStorage.FBIdToken;
if (token) {
  const decodedToken = jwtDecode(token);
  if (decodedToken.exp * 1000 < Date.now() ) {
    store.dispatch(logoutUser());

    this.props.history.push("/login");
  } else {
    store.dispatch({ type: SET_AUTHENTICATED });
    axios.defaults.headers.common["Authorization"] = token;
    store.dispatch(getUserData());
  }
}

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <div className="App">
            <Router>
              <Navbar />
              <div className="container">
                <Switch>
                  <Route exact path="/" component={home} />
                  <AuthRoute
                    exact
                    path="/login"
                    component={login}
                   
                  />
                  <AuthRoute
                    exact
                    path="/signup"
                    component={signup}
                   
                  />
                    <Route
                    exact
                    path="/newdate"
                    component={newdate}
                   
                  />
                  <Route exact path="/meeting" component={meeting} />
                  <Route exact path="/settings" component={settings} />
                  <Route exact path="/settings" component={settings} />
                  <Route exact path="/request" component={request} />
                  <Route exact path="/icreated" component={icreated} />
                </Switch>
              </div>
            </Router>
          </div>
        </Provider>
      </MuiThemeProvider>
    );
  }
}

export default App;
