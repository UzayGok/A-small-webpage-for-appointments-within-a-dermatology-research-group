import React from "react";


class customEventUser extends React.Component {
  constructor(props) {
    super(props);

    this.props = props;
  }



  render() {
    return (
     
      <div className="customEvent" >
         
        <p className="customEventTime" >
          {this.props.start.format("HH:mm") +
            " - " +
            this.props.end.format("HH:mm")}
        </p>
        <p  className="customEventBody">{this.props.Title}</p>
      </div>
    );
  }
}


export default customEventUser;
