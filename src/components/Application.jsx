import React, { Component } from 'react';
import Faker from 'faker';
import _ from 'lodash';

export default class Application extends Component {
    state = {
        messages: [],
        addMessage: ""
    }

    newinput = React.createRef();
    sseref = null;

    componentDidMount() {
        this.sseref = new EventSource("http://localhost:4000/data/v1/watch/task");
        this.sseref.addEventListener("message", (e) => {
            let data = JSON.parse(e.data);
            let newState = this.state.messages;
    
            if (data.action == 'insert') {
                newState.push({_id: data.task._id, text: data.task.text, checked: data.task.checked});
            }
            else if (data.action == 'delete') {
                let index = -1;

                for (let i = 0; i < newState.length; i++) {
                    if (newState[i]._id == data.task._id)
                        index = i;
                }

                newState.splice(index, 1);
            }
            else if (data.action == 'update') {
                let index = -1;

                for (let i = 0; i < newState.length; i++) {
                    if (newState[i]._id == data.task._id)
                        index = i;
                }

                _.assign(newState[index], data.task);
            }
    
            this.setState({ messages: newState });
        });

        fetch("http://localhost:4000/data/v1/read", { 
            method: "GET"
        }).then((response, error) => {
            if (response)
                return response.json();
        }).then((data, error) => {
            if (data)
                this.setState({messages: data});
        });
    }

    componentWillUnmount() {
        this.sseref.close();
    }

    SendMessageAdd(taskText) {
        fetch("http://localhost:4000/data/v1/create", {
            method: "POST",
            headers: {
                'content-type': "application/json"
            },
            body: JSON.stringify({
                text: taskText
            })
        });
    }

    SendMessageUpdate(index) {
        fetch("http://localhost:4000/data/v1/update", {
            method: "POST",
            headers: {
                'content-type': "application/json"
            },
            body: JSON.stringify({
                id: this.state.messages[index]._id,
                text: this.state.messages[index].text,
                checked: this.state.messages[index].checked
            })
        });
    }

    SendMessageDelete(id) {
        fetch("http://localhost:4000/data/v1/delete", {
            method: "POST",
            headers: {
                'content-type': "application/json"
            },
            body: JSON.stringify({
                "id": id
            })
        });
    }

    FakeTask() {
        if (_.has(this.newinput, "current.value")) {
            this.newinput.current.value = Faker.lorem.words(5+Math.round(Math.random()*10));
        }
    }

    AddTask() {
        if (_.has(this.newinput, "current.value")) {
            if (this.newinput.current.value.length != 0) {
                this.SendMessageAdd(this.newinput.current.value);
                this.setState({addMessage:""});
                this.newinput.current.value = "";
            }
            else {
                this.setState({addMessage:"You must enter some text"});
            }
        }
    }

    UpdateTask(index) {
        let newState = this.state.messages;
        newState[index].checked = !newState[index].checked;

        this.setState({messages: newState});

        this.SendMessageUpdate(index);
    }

    DeleteTask(index) {
        let messageID = this.state.messages[index]._id;

        this.SendMessageDelete(messageID);
    }

    RenderTasks() {
        if (!_.isEmpty(this.state.messages)) {
            return this.state.messages.map((task, index) => {
                return (
                    <div key={task._id} className="flex">
                        <div className="bg-gray-500 flex items-center">
                            <input type="checkbox" checked={task.checked} className="mx-2 w-7 h-7" onChange={this.UpdateTask.bind(this, index)} />
                        </div>
                        <div className="flex-grow px-2">{task.text}</div>
                        <button className="bi-x-circle text-white font-bold bg-gradient-to-b from-red-300 to-red-600 hover:from-red-100 hover:to-red-400 px-2" onClick={this.DeleteTask.bind(this, index)} />
                    </div>
                );
            });
        }
    }

    RenderAddMessage() {
        if (this.state.addMessage.length != 0) {
            return (<div className="text-sm font-bold text-red-600">{this.state.addMessage}</div>);
        }
    }

    render() {
        return(
            <>
            <header className="bg-blue-700 text-white text-2xl font-bold flex items-center">
                <div className="m-2"><img src="/src/images/planner.png" className="w-10 h-10" /></div>
                <div>ToDo Application</div>
            </header>
            <main className="flex-grow items-center justify-center bg-gray-400">
                <div className="w-3/4 bg-white mx-auto my-5 p-2 border-2 border-black rounded-lg flex flex-col">
                    <h1 className="text-3xl font-bold text-center border-b-2 border-black">Enter New Tasks</h1>
                    <div className="flex border rounded-md mt-3">
                        <div className="p-2 bg-gray-600 text-white font-bold rounded-l-md">Task Details</div>
                        <input type="text" placeholder="Enter Details..." ref={this.newinput} className="flex-grow p-2" />
                        <button className="bi-pencil py-2 px-5 font-bold bg-gradient-to-b from-yellow-300 to-yellow-600 hover:from-yellow-100 hover:to-yellow-400" onClick={this.FakeTask.bind(this)}> Faker</button>
                        <button className="bi-plus-circle py-2 px-5 font-bold bg-gradient-to-b from-green-300 to-green-600 hover:from-green-100 hover:to-green-400 rounded-r-md" onClick={this.AddTask.bind(this)}> Add</button>
                    </div>
                    {this.RenderAddMessage()}
                    <div className="flex flex-col border-t-2 border-b-2 border-black mt-3 divide-y divide-black">
                        {this.RenderTasks()}
                    </div>
                </div>
            </main>
            <footer className="bg-blue-700 text-white items-center text-center">
                &copy; 2021 Fake Co.
            </footer>
            </>
        );
    }
}