import React from 'react';
import styles from './SortDropdown.module.css'

interface SortDropdownProp {
  onClosingClick: (e: any) => void
}

const SortDropdown = React.forwardRef<HTMLDivElement, SortDropdownProp>(( {onClosingClick}, ref) => {
  React.useEffect(() => {
    document.addEventListener('click', onClosingClick);

    return (() => {
      document.removeEventListener('click', onClosingClick)
    })
  }, [])

  return (
    <div ref={ref} className={styles.dropdownContainer}>
      <ul>
        <li>Date Ascending ↑</li>
        <li>Data Descending ↓</li>
        <li>Sentiment Ascending ↑</li>
        <li>Sentiment Descending ↓</li>
      </ul>
    </div>
  );
})

export default SortDropdown;
