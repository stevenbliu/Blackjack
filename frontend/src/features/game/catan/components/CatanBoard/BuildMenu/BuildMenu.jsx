import React from 'react'
import styles from './BuildMenu.module.css'

export default function BuildMenu({ onBuild, onCancel }) {
  return (
    <div className={styles.container}>
      <p className={styles.title}>Build Menu</p>
      <button className={styles.button} onClick={() => onBuild('settlement')}>
        Settlement
      </button>
      <button className={styles.button} onClick={() => onBuild('city')}>
        City
      </button>
      <button className={styles.button} onClick={() => onBuild('road')}>
        Road
      </button>
      <button className={`${styles.button} ${styles.cancelButton}`} onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}
