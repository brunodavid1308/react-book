import React, { Component } from 'react';
import axios from 'axios';
import { sortBy } from 'lodash';
import PropTypes from 'prop-types';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faArrowDown,faArrowUp } from '@fortawesome/free-solid-svg-icons'
library.add(faSpinner,faArrowUp,faArrowDown)

const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';;
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage='; 

const  SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list,'title'),
  AUTHOR: list => sortBy(list,'author'),
  COMMENTS: list => sortBy(list,'num_comments').reverse(),
  POINTS: list => sortBy(list,'points').reverse(),
};


class App extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    
    this.state = {
      searchTerm: '',
      results:null,
      searchKey:'',
      error: null,
      isLoading: false,
    };
    this.onDismiss = this.onDismiss.bind(this); // Se puede omitir si se utilizan las arrow functions
    this.onSearchChange = this.onSearchChange.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.OnSearchSubmit = this.OnSearchSubmit.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.needToSearchTopStories = this.needToSearchTopStories.bind(this);
  }

  needToSearchTopStories (searchTerm){
      return !this.state.results[searchTerm];
  }
  setSearchTopStories(result){
    const { hits, page } = result;
    const { searchKey, results } = this.state;
    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      :[];
    const updatedHits = [...oldHits, ...hits];

    this.setState({
      results :{ 
        ...results,
        [searchKey]: {hits: updatedHits, page}
      },
      isLoading: false
    });
  }

  fetchSearchTopStories (searchTerm,page=0){
    this.setState({isLoading: true});
    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({error:error}));
  }
  OnSearchSubmit (event){
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm});
    
    if(this.needToSearchTopStories(searchTerm)){
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  componentDidMount () {
    this._isMounted = true;

    const {searchTerm} = this.state;
    this.setState({ searchKey: searchTerm});
    this.fetchSearchTopStories(searchTerm);
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  
  
  onDismiss(id){
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];
    
    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    this.setState({ 
      results : {
        ...results, 
        [searchKey]: { hits : updatedHits,page}
      }
    });
    
  }
  onSearchChange(event){
    this.setState({ searchTerm: event.target.value });
  }

  render() {
    const {searchTerm,results,searchKey,error,isLoading}=this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search 
            value ={searchTerm}
            onChange = {this.onSearchChange}
            onSubmit = {this.OnSearchSubmit}
          >
            Buscar
          </Search>
        </div>
        { error
          ? <div className="interactions">
            <p>Algo ha fallado</p>
          </div>
          : <Table 
            list={list}
            onDismiss={this.onDismiss}
          />
        }
        <div className="interactions">
          <ButtonWithLoading
            isLoading= {isLoading}
            onClick ={() => this.fetchSearchTopStories(searchKey, page + 1)}>
            Más
          </ButtonWithLoading>
        </div>
    </div>
    );
  }
}

class Search extends Component {
  
  componentDidMount(){
    if(this.input){
      this.input.focus();
    }
  }
  render(){
    const { 
      value, 
      onChange, 
      onSubmit,
      children 
    }= this.props;

    return (
      <form onSubmit ={onSubmit}>
        <input 
          type="text"
          value={value}
          onChange = {onChange}
          ref={(node) => {this.input = node;}}
        />
        <button type="submit">
          {children}
        </button>
      </form>
    );
  }
} 
  

class Table extends Component {

  constructor(props){
    super(props);

    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey){
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  render(){
    const {
      list,
      onDismiss,
    }= this.props;

    const {
      sortKey,
      isSortReverse,
    } = this.state;

    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse
      ? sortedList.reverse()
      : sortedList;

      return(
        <div className="table">
          <div className="table-header">
            <span style={{width: '45%'}}>
              <Sort 
                sortKey={'TITLE'}
                onSort={this.onSort}
                activeSortKey={sortKey}
                isSortReverse={isSortReverse}
              >
                Title
              </Sort>
            </span>
            <span style={{width: '20%'}}>
              <Sort 
                sortKey={'AUTHOR'}
                onSort={this.onSort}
                activeSortKey={sortKey}
                isSortReverse={isSortReverse}
              >
                Author
              </Sort>
            </span>
            <span style={{width: '15%'}}>
              <Sort 
                sortKey={'COMMENTS'}
                onSort={this.onSort}
                activeSortKey={sortKey}
                isSortReverse={isSortReverse}
              >
                Comments
              </Sort>
            </span>
            <span style={{width: '10%'}}>
              <Sort 
                sortKey={'POINTS'}
                onSort={this.onSort}
                activeSortKey={sortKey}
                isSortReverse={isSortReverse}
              >
                Points
              </Sort>
            </span>
            <span style={{width: '10%'}}>
              Archive
            </span>
          </div>
          {reverseSortedList.map(item =>
            <div key= {item.objectID} className="table-row">
              <span style={{width:'45%'}}>
                <a href = {item.url}>{item.title}</a>
              </span>
              <span style={{width:'20%'}}> {item.author}</span>
              <span style={{width:'15%'}}> {item.num_comments}</span>
              <span style={{width:'10%'}}> {item.points}</span>
              <span style={{width:'10%'}}> sortKey={sortKey}
            onSort={this.onSort}
            isSortReverse={isSortReverse}
                <Button 
                onClick = {() => onDismiss(item.objectID)}
                className="button-inline"
                >
                  Ocultar
                </Button>
              </span>
            </div>
          )}
        </div>
    
      );
  }
    
} 

const Button = ({ onClick, className = '', children }) =>
  <button
    onClick={onClick}
    className={className}
    type="button"
  >
    {children}
  </button>

const Loading = () =>
    <div>
        <FontAwesomeIcon icon = "spinner"></FontAwesomeIcon>
    </div>

const withLoading = (Component) => ({isLoading, ...rest}) =>
  isLoading
    ? <Loading/>
    : <Component { ...rest }/>

const ButtonWithLoading = withLoading(Button);

const Sort = ({sortKey, onSort,activeSortKey,isSortReverse, children}) =>{
  const sortClass = ['button-inline'];
  const sortIcon = isSortReverse && sortKey === activeSortKey
    ? 'arrow-down'
    : 'arrow-up'
  if (sortKey === activeSortKey) {
    sortClass.push('button-active');
  }
  return (
    <div>
      <Button 
        onClick = {() => onSort(sortKey)}
        className = {sortClass.join(' ')}
      >
        {children}
      </Button>
      <span style={{marginLeft:'5px'}}>
        <FontAwesomeIcon icon = {sortIcon}></FontAwesomeIcon>
      </span>
    </div>
    
  );
}
export default App;
export {Button,Search,Table};