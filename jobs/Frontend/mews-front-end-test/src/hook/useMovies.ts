import { useCallback, useEffect, useReducer } from 'react';
import { getMoviesRequest, Movie, MovieApiResponse } from '../api/sendRequest';
import { initialMovieState, reducer } from './reducer';
import { useDispatch } from 'react-redux';
import { Dispatch } from '@reduxjs/toolkit';
import { useAppSelector } from '../redux/hooks/hooks';
import {
  getMoviesSelector,
  getNumberOfPagesSelector,
  getPageSelector,
  getSearchQuerySelector,
} from '../redux/selectors';

export interface UseMovies {
  movies: Movie[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  page: number;
  numberOfPages: number;
  incrementPageNumber: () => void;
  decrementPageNumber: () => void;
  dispatch: Dispatch;
}

const useMovies = (): UseMovies => {
  const reduxDispatch = useDispatch();
  const lastMovies = useAppSelector(getMoviesSelector);
  const lastSearchQuery = useAppSelector(getSearchQuerySelector);
  const lastPage = useAppSelector(getPageSelector);
  const lastNumberOfPages = useAppSelector(getNumberOfPagesSelector);

  const [moviesState, dispatch] = useReducer(
    reducer,
    initialMovieState,
    (initialState) => {
      if (Boolean(lastSearchQuery)) {
        return {
          movies: lastMovies,
          searchQuery: lastSearchQuery,
          page: lastPage,
          numberOfPages: lastNumberOfPages,
        };
      }

      return initialState;
    },
  );

  const { movies, searchQuery, page, numberOfPages } = moviesState;

  const incrementPageNumber = () => {
    dispatch((previous) => {
      if (previous.page === numberOfPages) {
        return previous;
      }

      return { ...previous, page: previous.page + 1 };
    });
  };

  const decrementPageNumber = () => {
    dispatch((previous) => {
      if (previous.page === 1) {
        return previous;
      }

      return { ...previous, page: previous.page - 1 };
    });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ searchQuery: query, page: 1 });
  };

  const getMovies = useCallback(getMoviesRequest, [getMoviesRequest]);

  useEffect(() => {
    if (Boolean(searchQuery)) {
      getMovies(searchQuery, page)
        .then((response: MovieApiResponse) => {
          dispatch({
            movies: response.results,
            numberOfPages: response.total_pages,
            page: response.page,
          });

          console.log('response: ', response);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      dispatch({ ...initialMovieState });
    }
  }, [searchQuery, page, getMovies]);

  return {
    movies,
    searchQuery,
    numberOfPages,
    page,
    setSearchQuery,
    incrementPageNumber,
    decrementPageNumber,
    dispatch: reduxDispatch,
  };
};

export { useMovies };