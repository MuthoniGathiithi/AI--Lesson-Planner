import React from 'react';
import styles from './TabletMockup.module.css';

const TabletMockup = () => {
  return (
    <div className={styles.tabletFrame}>
      <div className={styles.tabletCamera}></div>
      <div className={styles.tabletScreen}>
        <div className={styles.screenContent}>
          <div className={styles.header}>
            <h1>LESSON PLAN</h1>
            <div className={styles.underline}></div>
          </div>

          <div className={styles.section}>
            <h2>ADMINISTRATIVE DETAILS</h2>
            
            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.label}>School:</span>
                <div className={styles.valueBox}>Masomo High School</div>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Subject:</span>
                <div className={styles.valueBox}>Geography</div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Year:</span>
                <div className={styles.valueBox}>14</div>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Term:</span>
                <div className={styles.valueBox}>1</div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Date:</span>
                <div className={styles.valueBox}>2026-01-14</div>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Time:</span>
                <div className={styles.valueBox}>08:00 - 08:40</div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Grade:</span>
                <div className={styles.valueBox}>10</div>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Roll:</span>
                <div className={styles.valueBox}>Boys: 0, Girls: 0, Total: 0</div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>TEACHER DETAILS</h2>
            
            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Name:</span>
                <div className={styles.valueBox}>Joyce Muthoni</div>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>TSC Number:</span>
                <div className={styles.valueBox}>2345-88</div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>STRAND</h2>
            <div className={styles.fullWidthBox}>Natural Systems And Processes</div>
          </div>

          <div className={styles.section}>
            <h2>SUB-STRAND</h2>
            <div className={styles.fullWidthBox}>Vulcanicity</div>
          </div>

          <div className={styles.section}>
            <h2>LESSON LEARNING OUTCOMES</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabletMockup;