import React from "react";
const Link = require("react-router-dom").Link;

class customEvent extends React.Component {
  constructor(props) {
    super(props);

    this.props = props;
    this.ToMeet = { 
      pathname: "/meeting", 
      date: props
    };
  }



  render() {
    return (
      <Link to={this.ToMeet} style={{ textDecoration: 'none' }}>
      <div className="customEvent" onClick={this.changeRoute}>
        <p className="customEventTime" >
          {this.props.start.format("HH:mm") +
            " - " +
            this.props.end.format("HH:mm")}
        </p>
        <p>{this.props.Title}</p>
        <p className="customEventBody">{this.props.content}</p>
      </div></Link>
    );
  }
}


export default customEvent;
