import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const charset = ' 0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*-_+=:;",.?//({{<>}})'.split("");
let input_str = 'no, the only tired i was, was tired of giving in - harriet tubman';

class Button extends React.Component {
  constructor(props) {
    super(props)
    this.submit = this.submit.bind(this)
  }
  submit () {
    ReactDOM.unmountComponentAtNode(document.getElementById("root"))
    ReactDOM.render(<TickerBoard initial_state={rebuild_string(io((document.getElementById('i').value).toLowerCase()))}/>, document.getElementById("root"))
  }
  render() {
    return ( <button class="button" id="b"onClick={this.submit}>submit</button> )
  }
}

class Input extends React.Component {
  constructor(props) { super(props) }
  render() {
    return ( <input class="input" id="i" defaultValue={input_str} maxlength="140" type="text"></input> )
  }
}

class Tile extends React.Component {
  constructor(props) {
    super(props)
    this.goal = props.goal
    this.charset_index = 0
    this.state = {current:charset[this.charset_index]}
    this.find_goal()
  }

  wait () {
    return new Promise((resolve,  reject) => {
      setTimeout(()=>{
        resolve()
      },50)
    })
  };

  async find_goal() {
    for (let i = this.charset_index;i<charset.indexOf(this.goal);i++) {
      this.state.current = charset[i+1]
      this.setState({current:charset[i+1]})
      await this.wait()
    }
  }

  render() {
    if (this.goal == ' ') {
      return ( <div class="tile_b"></div> )
    } else if (this.goal) {
      return ( <div class="tile_a">{this.state.current}</div> )
    } else {
      return ( <div class="tile_b"></div> )
    }
  }
}

class TickerBoard extends React.Component {
  constructor(props) {
    super(props)
    this.max_num_characters = 135
    this.initial_state = props.initial_state.split("")
  }
  render_tiles () {
    let tiles = []
    for (let i = 0; i < this.max_num_characters; i++) {
      tiles.push(<Tile goal={this.initial_state.shift()}/>)
    }
    return tiles
  }
  render() {
    return ( <div class="ticker_board">{this.render_tiles()}</div> )
  }
}

// generate array of integers ranging from x to y, increase each successive value by step
// ex : x:2, y:16, step:2 -> [2, 4, 6, 8, 10, 12, 14]
let generate_range = (x, y, step) => {
  let xx = []
  for (let i = x; i < y; i+=step) {
    xx.push(i)
  }
  return xx
}

let range_of_intersects = generate_range (15, 140, 15)

// for each word map to -> {word:<w>, start_index:<si>, end_index<ei>}
let generate_word_index_struct = (s) => {
  let s_arr = s.split(" ")
  let total_characters = 0
  let arr_of_word_indexes = []
  for (let i = 0; i < s_arr.length; i++) {
    let x = {word:s_arr[i],start:total_characters,end:total_characters+s_arr[i].length}
    arr_of_word_indexes.push(x)
    total_characters += s_arr[i].length+1
  }
  return arr_of_word_indexes
}

// intersects, return true if integer point is within (range.x - range.y), else false
let intersects = (range, point) => {
  // range : [x, y]; point : z
  // ex : range : [5, 10], point : 7; intersects? true
  let range_arr = generate_range(range.x, range.y, 1)
  if (range_arr.includes(point)) {return true} else {return false}
}

// generate range from range.x to range.y, return value which intersects from list range_of_intersects
let get_intersecting_node = (range, range_of_intersects) => {
  for (let x in range_of_intersects) {
    if (intersects({x:range.x,y:range.y}, range_of_intersects[x])) return range_of_intersects[x]
  }
}

// take a list of intersects struct : {word, start, end}, rebuild string with spacing
let rebuild_string = (lst_of_intersects) => {
  let s = lst_of_intersects[0].word
  for (let i = 1; i < lst_of_intersects.length;i++) {
    s+= " " + lst_of_intersects[i].word
  }
  return s
}

// input string, output string with appropriate spacing
let io = (input_str) => {
  let word_index_struct = generate_word_index_struct(input_str)

  //  map from {word:string, start:int, end:int} to {word:string, ... , end:int, intersects:boolean}
  let lst_of_intersects = word_index_struct.map((e) => {
    let flag = false
    for (let x in range_of_intersects) {
      if (intersects({x:e.start,y:e.end},range_of_intersects[x])) flag = true
    }
    e.intersects = flag
    return e
  });

  // apply spacing to each word
  for (let x = 0; x < lst_of_intersects.length; x++) {
    if (lst_of_intersects[x].intersects) {
      let start = lst_of_intersects[x].start
      let intersecting_index = get_intersecting_node({x:lst_of_intersects[x].start,y:lst_of_intersects[x].end}, range_of_intersects)
      let additional_spaces = intersecting_index - start
      let prependage = ''
      for (let i = 0; i < additional_spaces; i++) { prependage += " " }
      lst_of_intersects[x].word = prependage + lst_of_intersects[x].word
      for (let j = x; j < lst_of_intersects.length; j++) {
        lst_of_intersects[j].start += additional_spaces
        lst_of_intersects[j].end = lst_of_intersects[j].start + lst_of_intersects[j].word.length
        let flag = false
        for (let xx in range_of_intersects) {
          if (intersects({x:lst_of_intersects[j].start,y:lst_of_intersects[j].end},range_of_intersects[xx])) flag = true
        }
        lst_of_intersects[j].intersects = flag
      }
    }
  }
  return lst_of_intersects
}

ReactDOM.render(<Input />, document.getElementById('input'))
ReactDOM.render(<Button />, document.getElementById('button'))
ReactDOM.render(<TickerBoard initial_state={rebuild_string(io(input_str.toLowerCase()))}/>, document.getElementById("root"));
