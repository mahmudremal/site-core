import VideoSection from './utils/VideoSection';
import { __ } from '@js/utils';

const Search = () => {
  const queryParams = new URLSearchParams(window.location.search);
  
  return <VideoSection filters={{ q: queryParams.get('q') }} />;
};

export default Search;