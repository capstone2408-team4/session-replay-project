import React from 'react';
import styles from './SortDropdown.module.css'

interface SortDropdownProp {
  onClosingClick: (e: MouseEvent) => void
  onSort: (sortType: string) => void
  onCloseDropdown: () => void
}

const SortDropdown = React.forwardRef<HTMLDivElement, SortDropdownProp>(
  ({onClosingClick, onSort, onCloseDropdown}, ref) => {
  React.useEffect(() => {
    document.addEventListener('click', onClosingClick);

    return (() => {
      document.removeEventListener('click', onClosingClick)
    })
  }, [onClosingClick])

  const handleSortChoice = function(sortType: string) {
    onSort(sortType);
    onCloseDropdown();
  }

  return (
    <div ref={ref} className={styles.dropdownContainer}>
      <ul>
        <li><button onClick={() => handleSortChoice('Time Ascending')}>Time Ascending ↑</button></li>
        <li><button onClick={() => handleSortChoice('Time Descending')}>Time Descending ↓</button></li>
      </ul>
    </div>
  );
})

SortDropdown.displayName = 'SortDropdown';

export default SortDropdown;
