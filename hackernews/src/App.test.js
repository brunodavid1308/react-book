import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Enzyme,{shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'
import App,{Search,Button,Table,updateSearchTopStoriesState} from './App';

Enzyme.configure({ adapter : new Adapter() });

describe('App', () => {

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <App />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    });

});

describe('Search', () => {

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Search>Search</Search>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Search>Search</Search>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    });

});

describe('Button', () => {

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Button >Más</Button>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Button>Más</Button>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

  });

  it('coincidencia tipo y valor classname', () => {
    const component = shallow(
      <Button className="ola">Más</Button>
    );
    expect(typeof(component.props().className)).toBe('string');
    expect(component.props().children).toEqual('Más');
  });

});

describe('Table', () => {

  const props = {
    list:[
      { tittle:'1', author:'1',num_comments:1, points:2,objectID:'y' },
      { tittle:'2', author:'2',num_comments:1, points:2,objectID:'z' },
    ],
    sortKey:'TITLE',
    isSortReverse: false,
  };

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Table {...props}/>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Table {...props}/>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    });

  it('muestra dos items en la lista', () => {
    const element = shallow(
      <Table { ...props } />
    );
    expect(element.find('.table-row').length).toBe(2);
  });

});

