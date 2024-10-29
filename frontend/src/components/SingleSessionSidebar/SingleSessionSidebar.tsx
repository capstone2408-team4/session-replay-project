import React from 'react';
import SortDropdown from '../SortDropdown';
import styles from './SingleSessionSidebar.module.css'
import down from '../../assets/down.png'
import SessionCard from '../SessionCard';
import FilterPopover from '../FilterPopover';
import { Session } from '../../Types';


interface SingleSessionSidebarProps {
  sessions: Session[]
  onSessionSelect: (session: Session) => void
  onSort: (sortType: string) => void
  onFilter: (filterType: string, range?: null | number) => void
  selectedSession: Session | null
}

function SingleSessionSidebar( { sessions, onSessionSelect, onSort, onFilter, selectedSession } : SingleSessionSidebarProps) {
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);
  const [showFilterPopover, setShowFilterPopover] = React.useState(false);
  const [radioChoice, setRadioChoice] = React.useState('')

  const handleRadioSelect = function(selection: string) {
    setRadioChoice(selection)
  }
   
  const toggleDropdown = function(e: React.MouseEvent) {
    e.stopPropagation()
    setShowFilterPopover(false)
    setShowSortDropdown((prev) => !prev)
  }

  const togglePopover= function(e: React.MouseEvent) {
    e.stopPropagation()
    setShowSortDropdown(false)
    setShowFilterPopover((prev) => !prev)
  }

  const handleClosingClick = function(e: React.MouseEvent) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowSortDropdown(false)
    } 
    if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
      setShowFilterPopover(false)
    }  
  }

  const closePopover = function() {
    setShowFilterPopover(false)
  }

  const closeDropdown = function() {
    setShowSortDropdown(false)
  }
 
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  const popoverRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <div className={styles.sidebarMain}>
      <div className={styles.sidebarHeader}>
        <button onClick={toggleDropdown} className={styles.sidebarButton}>
          Sort
          <svg width={30} height={30} xmlns="http://www.w3.org/2000/svg">
            <image href={down} x='2' y='6'height='20'width='20' />
          </svg>
        </button>
        {showSortDropdown && <SortDropdown onCloseDropdown={closeDropdown} onSort={onSort} onClosingClick={handleClosingClick} ref={dropdownRef}/>}
        <button onClick={togglePopover} className={styles.sidebarButton}>
          Filter
          <svg width={30} height={30} xmlns="http://www.w3.org/2000/svg">
            <image href={down} x='2' y='6' height='20' width='20' />
          </svg>
        </button>
        {showFilterPopover && <FilterPopover onClosePopover={closePopover} onRadioSelect={handleRadioSelect} radioChoice={radioChoice} onFilter={onFilter} onClosingClick={handleClosingClick} ref={popoverRef}/>}
      </div>
      {sessions.map(session => {
        return <SessionCard isActive={!!selectedSession && session.id === selectedSession.id} key={session.id} onSessionSelect={onSessionSelect} session={session} />
      })}
    </div>
    
  );
}

export default SingleSessionSidebar;
