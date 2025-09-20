# To-Do App

A simple, responsive To-Do web application built with **Vanilla JS, Tailwind CSS, and Bootstrap Icons**.

Add, edit, delete, filter, and sort tasks — complete with due dates, a soft-delete system, theme customization, and persistent storage via localStorage.

![demo](demo.gif)

Live Project: [https://mvntahax.github.io/to-do-app/](https://mvntahax.github.io/to-do-app/)

## Features

- **Add Tasks** with optional due date/time  
- **Edit Tasks** inline with a single click  
- **Mark Tasks as Completed** (checkbox toggle)  
- **Soft Delete + Restore** (with separate deleted tasks view)  
- **Permanent Delete** option  
- **Sort by Order** (ascending/descending)  
- **Filter by Status** (All, Completed, Pending, Deleted)  
- **Theme Selector** with 6 built-in themes:
  - Light, Dark, Space, Coffee, Sunset, Midnight  
- **Persistent Storage** – Tasks & themes saved in `localStorage`  
- **Responsive UI** – Mobile sidebar toggle + clean layout  
- **Smooth Animations** for task rendering and modal transitions  
- **Lightweight** – No frameworks required, just HTML + CSS + JS  

## Tech Stack

- **Frontend:** HTML5, Tailwind CSS, Bootstrap Icons  
- **JavaScript:** Vanilla JS (No frameworks)  
- **Storage:** Browser `localStorage` for tasks & deleted tasks  

## Installation

Clone the repo:

```bash
git clone https://github.com/your-username/todo-app.git
cd todo-app
````

Open `index.html` directly in your browser — no build steps required (100% client-side).


## Usage

1. **Add a Task** – Enter task text (and optional date/time) then press **Enter** or click **Add**
2. **Complete a Task** – Toggle the checkbox
3. **Edit a Task** – Click the ✏️ icon, update, and save
4. **Delete a Task** – Click ❌ to move it to Deleted view
5. **Restore/Remove** – Go to Deleted filter and restore ♻ or permanently delete 🗑
6. **Change Theme** – Click the 🎨 button in the navbar and pick your favorite
7. **Sort & Filter** – Use the buttons to adjust task order or view by status

## Contributing

Contributions are welcome!
Feel free to **fork** this repo, open an **issue**, or submit a **pull request** with improvements.


## License

This project is licensed under the **MIT License**.
Feel free to use, modify, and distribute it.

## Author

Built with 💙 by [@mvntahax](https://github.com/mvntahax)
