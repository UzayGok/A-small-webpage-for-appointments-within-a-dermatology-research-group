import React, { Component } from "react";
import WeekCalendar from "react-week-calendar";
import customEvent from "./customEvent";
import "react-week-calendar/dist/style.css";


class Calendar extends Component {
  render() {
    return (
      <WeekCalendar
        firstDay={this.props.firstday}
        dayFormat="ddd"
        endTime={{ h: 21, m: 30 }}
        startTime={{ h: 7, m: 0 }}
        scaleUnit={30}
        cellHeight={20}
 
        selectedIntervals={this.props.inter}
        useModal={false}
        eventComponent={customEvent}
      ></WeekCalendar>
    );
  }
}

export default Calendar;
