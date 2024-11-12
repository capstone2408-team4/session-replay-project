import React from 'react';
import styles from './FilterPopover.module.css'

interface FilterPopoverProp {
  onClosingClick: (e: MouseEvent) => void
  onFilter: (filterType: string, dayRange: number | null) => void
  onRadioSelect: (selection: string) => void
  radioChoice: string
  onClosePopover: () => void
}

const FilterPopover = React.forwardRef<HTMLDivElement, FilterPopoverProp>(( {onClosingClick, onFilter, onRadioSelect, radioChoice, onClosePopover}, ref) => {
  const [dayRange, setDayRange] = React.useState<number>(1)

  const handleRadioSelection = function(e: React.ChangeEvent<HTMLInputElement>) {
    onRadioSelect(e.target.value)
  }

  const handleDayRangeInput = function(e: React.ChangeEvent<HTMLInputElement>) {
    const input = parseInt(e.target.value)
    if (!isNaN(input)) {
      setDayRange(parseInt(e.target.value));
    } else {
      setDayRange(0);
    }
  }

  const handleSubmit = function(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onFilter(radioChoice, dayRange)
    if (radioChoice === 'remove') {
      onRadioSelect('')
    }

    onClosePopover()
  }

  React.useEffect(() => {
    document.addEventListener('click', onClosingClick);

    return (() => {
      document.removeEventListener('click', onClosingClick)
    })
  }, [onClosingClick])

  return (
    <div ref={ref} className={styles.popoverContainer}>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <input
            type="radio"
            name="today"
            id="today"
            value="today"
            checked={radioChoice === 'today'}
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
          <br />
          <input
            type="radio"
            name="remove"
            id="remove"
            value="remove"
            checked={radioChoice === 'remove'}
            onChange={handleRadioSelection}
          />
          <label htmlFor="remove">Remove All</label>
          <button type='submit'>Filter</button>
        </fieldset>
      </form>
    </div>
  );
})

export default FilterPopover;

