import React from 'react';
import styles from './FilterPopover.module.css'

interface FilterPopoverProp {
  onClosingClick: (e: any) => void
}

const FilterPopover = React.forwardRef<HTMLDivElement, FilterPopoverProp>(( {onClosingClick}, ref) => {
  const [radioChoice, setRadioChoice] = React.useState<null | string>(null)
  const [dayRange, setDayRange] = React.useState<number | string>('')

  const handleRadioSelection = function(e: React.ChangeEvent<HTMLInputElement>) {
    setRadioChoice(e.target.value)
  }

  const handleFilter = function(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (radioChoice) {
      alert('filtering')
    }
  }

  const handleDayRangeInput = function(e: React.ChangeEvent<HTMLInputElement>) {
    const input = parseInt(e.target.value)
    if (!isNaN(input)) {
      setDayRange(e.target.value)
    } else {
      setDayRange('')
    }
  }

  React.useEffect(() => {
    document.addEventListener('click', onClosingClick);

    return (() => {
      document.removeEventListener('click', onClosingClick)
    })
  }, [])

  return (
    <div ref={ref} className={styles.popoverContainer}>
      <form onSubmit={handleFilter}>
        <fieldset>
          <input
            type="radio"
            name="today"
            id="today"
            value="today"
            checked={radioChoice === 'today'}// state change here boolean
            onChange={handleRadioSelection}
          />
          <label htmlFor="today">Today</label>
          <br />
          <input
            type="radio"
            name="yesterday"
            id="yesterday"
            value="yesterday"
            checked={radioChoice === 'yesterday'}
            onChange={handleRadioSelection}
          />
          <label htmlFor="yesterday">Yesterday</label>
          <br />
          <input
            type="radio"
            name="range"
            id="range"
            value="range"
            checked={radioChoice === 'range'}
            onChange={handleRadioSelection}
          />
          <label htmlFor="range">Last
            <input value={dayRange} onChange={handleDayRangeInput} min='0'max='30' className={styles.numberInput}type='number'></input>
            Days
          </label>
          <button type='submit'>Chips Ahoy!</button>
        </fieldset>
      </form>
    </div>
  );
})

export default FilterPopover;

