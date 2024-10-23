import React from 'react';
import styles from './SortDropdown.module.css'

function SortDropdown() {
  const [dropdownIsOpen, setShowSortDropdown] = React.useState(true)

  React.useEffect(() => {

  }, [])


  return (
    <div id='sortDropdown' className={styles.dropdownContainer}>
      <ul>
        <li>Sort Ascending ↑</li>
        <li>Sort Descending ↓</li>
      </ul>
    </div>
  );
}

export default SortDropdown;
