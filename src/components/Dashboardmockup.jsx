import React from 'react';
import './Tabletmockup.module .css';

const TabletMockup = () => {
  return (
    <div className="tabletFrame">
      <div className="tabletCamera"></div>
      <div className="tabletScreen">
        <div className="screenContent">
          <div className="header">
            <h1>LESSON PLAN</h1>
            <div className="underline"></div>
          </div>

          <div className="section">
            <h2>ADMINISTRATIVE DETAILS</h2>
            
            <div className="detailRow">
              <div className="detailItem">
                <span className="label">School:</span>
                <div className="valueBox">Masomo High School</div>
              </div>
              <div className="detailItem">
                <span className="label">Subject:</span>
                <div className="valueBox">Geography</div>
              </div>
            </div>

            <div className="detailRow">
              <div className="detailItem">
                <span className="label">Year:</span>
                <div className="valueBox">14</div>
              </div>
              <div className="detailItem">
                <span className="label">Term:</span>
                <div className="valueBox">1</div>
              </div>
            </div>

            <div className="detailRow">
              <div className="detailItem">
                <span className="label">Date:</span>
                <div className="valueBox">2026-01-14</div>
              </div>
              <div className="detailItem">
                <span className="label">Time:</span>
                <div className="valueBox">08:00 - 08:40</div>
              </div>
            </div>

            <div className="detailRow">
              <div className="detailItem">
                <span className="label">Grade:</span>
                <div className="valueBox">10</div>
              </div>
              <div className="detailItem">
                <span className="label">Roll:</span>
                <div className="valueBox">Boys: 0, Girls: 0, Total: 0</div>
              </div>
            </div>
          </div>

          <div className="section">
            <h2>TEACHER DETAILS</h2>
            
            <div className="detailRow">
              <div className="detailItem">
                <span className="label">Name:</span>
                <div className="valueBox">Joyce Muthoni</div>
              </div>
              <div className="detailItem">
                <span className="label">TSC Number:</span>
                <div className="valueBox">2345-88</div>
              </div>
            </div>
          </div>

          <div className="section">
            <h2>STRAND</h2>
            <div className="fullWidthBox">Natural Systems And Processes</div>
          </div>

          <div className="section">
            <h2>SUB-STRAND</h2>
            <div className="fullWidthBox">Vulcanicity</div>
          </div>

          <div className="section">
            <h2>LESSON LEARNING OUTCOMES</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabletMockup;