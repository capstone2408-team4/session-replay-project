import React from 'react';
import styles from './SortDropdown.module.css'

interface SortDropdownProp {
  onClosingClick: (e: any) => void
  onSort: (sortType: string) => void
}

const SortDropdown = React.forwardRef<HTMLDivElement, SortDropdownProp>(( {onClosingClick, onSort}, ref) => {
  React.useEffect(() => {
    document.addEventListener('click', onClosingClick);

    return (() => {
      document.removeEventListener('click', onClosingClick)
    })
  }, [])

  return (
    <div ref={ref} className={styles.dropdownContainer}>
      <ul>
        <li><button onClick={() => onSort('Time Ascending')}>Time Ascending ↑</button></li>
        <li><button onClick={() => onSort('Time Descending')}>Time Descending ↓</button></li>
        <li><button>Sentiment Ascending ↑</button></li>
        <li><button>Sentiment Descending ↓</button></li>
      </ul>
    </div>
  );
})

export default SortDropdown;
