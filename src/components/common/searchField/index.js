import { useState, useMemo, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';

const SearchInput = ({ placeholder = 'Search', onChange }) => {
  const [inputValue, setInputValue] = useState('');
const handleSearch = (event) => {
    setInputValue(event.target.value);
    handleSearchQueryChange(event.target.value);
  };

  const handleSearchQueryChange = debounce((event) => {
    onChange(event);
  }, 500);

  return (
    <div className="w-full max-w-md relative">
      <div className="flex items-center border border-gray-300 rounded-xl bg-white px-4 py-2">
        <SearchIcon className="text-gray-400 mr-2" fontSize="small" />
        <input
          type="text"
          value={inputValue}
          onChange={handleSearch}
          placeholder={placeholder}
          className="w-full text-sm outline-none h-[30px] bg-transparent placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};

export default SearchInput;
