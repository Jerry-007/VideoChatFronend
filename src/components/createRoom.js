import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import "../styles/createRoom.css";

const CreateRoom = (props) => {
  const [meetingLink, setMeetingLink] = useState("");

  const create = () => {
    const id = uuid();
    props.history.push(`/room/${id}`);
  };

  return (
    <div className="main">
      <div className="content">
        <h1>Video Meetings Now for Everyone !</h1>
        <p className="mt-3">
          Create Meetings just with a single click of button.
          <br />
          Join Meetings just by entering the Url of the meeting.
        </p>
        <form className="content-form">
            <button type="submit" disabled style={{display:"none"}} aria-hidden="true"></button>
          <div>
            <button
              className="btn"
              style={{ backgroundColor: "#08D9D6" }}
              onClick={() => create()}
            >
              New Meeting
            </button>
          </div>
          <div className="d-flex flex-row ms-4">
            <input
              type="text"
              className="form-control form-control-sm w-75 me-2"
              placeholder="Enter the Meeting Link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              onSubmit={() => console.log("submited")}
            />
            <button
              className="btn"
              style={
                meetingLink.length > 0
                  ? { color: "#08D9D6", backgroundColor: "#252A34" }
                  : { color: "##252A34", backgroundColor: "#252A34" }
              }
              onClick={() => props.history.push(`/room/${meetingLink}`)}
            >
              Join
            </button>
          </div>
        </form>
      </div>
      <div
        id="carouselExampleIndicators"
        className="carousel  slide"
        data-bs-ride="carousel"
      >
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="0"
            className="active"
            aria-current="true"
            aria-label="Slide 1"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="1"
            aria-label="Slide 2"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="2"
            aria-label="Slide 3"
          ></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="/image1.jpg" alt="image1" />
          </div>
          <div className="carousel-item">
            <img src="/image4.jpg" alt="image4" />
          </div>
          <div className="carousel-item">
            <img src="/image3.jpg" alt="image3" />
          </div>
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;
