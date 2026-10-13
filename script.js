/* Phần C: Xử lý JavaScript */

// 1. Hiển thị 5 công việc mẫu từ mảng đối tượng
let tasks = [
  { id: 1, title: "Làm bài tập Lập trình web", dueDate: "2026-10-10", priority: "Cao", completed: false }, // Bài mẫu quá hạn
  { id: 2, title: "Học từ vựng Tiếng Anh", dueDate: "2026-10-16", priority: "Trung bình", completed: true },
  { id: 3, title: "Đọc sách Tin học cơ bản", dueDate: "2026-10-18", priority: "Thấp", completed: false },
  { id: 4, title: "Ôn tập Giải tích", dueDate: "2026-10-20", priority: "Cao", completed: false },
  { id: 5, title: "Nộp báo cáo nhóm", dueDate: "2026-10-15", priority: "Thấp", completed: false }
];

// Thứ tự mức độ ưu tiên từ Thấp -> Cao
const priorityOrder = {
  "Thấp": 1,
  "Trung bình": 2,
  "Cao": 3
};

// Lấy element từ DOM
const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskDateInput = document.getElementById("task-date");
const taskPrioritySelect = document.getElementById("task-priority");
const errorMsg = document.getElementById("error-msg");

const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const taskListUl = document.getElementById("task-list");

// Khóa không cho chọn ngày quá khứ khi THÊM MỚI
if (taskDateInput) {
  const todayStr = new Date().toISOString().split("T")[0];
  taskDateInput.setAttribute("min", todayStr);
}

// Hàm kiểm tra công việc có bị quá hạn hay không
function isTaskOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  
  const selectedDate = new Date(task.dueDate);
  const today = new Date();
  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return selectedDate < today;
}

// Hàm render hiển thị danh sách công việc
function renderTasks() {
  taskListUl.innerHTML = "";

  const keyword = searchInput.value.toLowerCase().trim();
  const filterValue = statusFilter.value;

  // Lọc theo tìm kiếm & trạng thái
  let filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(keyword);
    let matchesStatus = true;

    if (filterValue === "COMPLETED") matchesStatus = task.completed;
    if (filterValue === "UNCOMPLETED") matchesStatus = !task.completed;

    return matchesSearch && matchesStatus;
  });

  // SẮP XẾP: Quá hạn ưu tiên lên đầu -> Hạn gần nhất -> Mức ưu tiên Thấp đến Cao
  filteredTasks.sort((a, b) => {
    const aOverdue = isTaskOverdue(a);
    const bOverdue = isTaskOverdue(b);

    // 1. Quá hạn đẩy lên đầu
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // 2. Hạn gần nhất
    if (a.dueDate && b.dueDate) {
      if (a.dueDate !== b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
    } else if (a.dueDate && !b.dueDate) {
      return -1;
    } else if (!a.dueDate && b.dueDate) {
      return 1;
    }

    // 3. Mức ưu tiên từ Thấp đến Cao
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Xuất HTML
  filteredTasks.forEach(task => {
    const overdue = isTaskOverdue(task);
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""} ${overdue ? "overdue" : ""}`;

    li.innerHTML = `
      <div class="task-info">
        <span class="task-title">${task.title}</span>
        <span class="task-meta">
          Hạn: <span class="${overdue ? "overdue-text" : ""}">${task.dueDate || "Không có"}</span>
          ${overdue ? '<span class="overdue-badge">Quá hạn</span>' : ""} | 
          Ưu tiên: <span class="priority-badge priority-${task.priority.replace(" ", "-")}">${task.priority}</span>
        </span>
      </div>
      <div class="task-actions">
        <button class="btn-action btn-toggle" onclick="toggleTask(${task.id})">
          ${task.completed ? "Chưa xong" : "Hoàn thành"}
        </button>
        <button class="btn-action btn-delete" onclick="deleteTask(${task.id})">Xóa</button>
      </div>
    `;

    taskListUl.appendChild(li);
  });
}

// Thêm công việc từ Form (kiểm tra rỗng & ngày quá khứ)
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = taskTitleInput.value.trim();
  const dueDate = taskDateInput.value;
  const priority = taskPrioritySelect.value;

  if (title === "") {
    errorMsg.innerText = "Tên công việc không được để trống!";
    return;
  }

  if (dueDate) {
    const selectedDate = new Date(dueDate);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      errorMsg.innerText = "Hạn hoàn thành không được chọn ngày trong quá khứ!";
      return;
    }
  }

  errorMsg.innerText = "";

  const newTask = {
    id: Date.now(),
    title: title,
    dueDate: dueDate,
    priority: priority,
    completed: false
  };

  tasks.push(newTask);
  renderTasks();

  // Reset form
  taskTitleInput.value = "";
  taskDateInput.value = "";
  taskPrioritySelect.value = "Trung bình";
});

// Đánh dấu hoàn thành
function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  renderTasks();
}

// Xóa công việc
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  renderTasks();
}

// Sự kiện Lọc & Tìm kiếm
searchInput.addEventListener("input", renderTasks);
statusFilter.addEventListener("change", renderTasks);

// Chạy lần đầu
renderTasks();