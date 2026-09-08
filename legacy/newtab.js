const today = new Date();

const dateElement = document.getElementById("date");
const focusElement = document.getElementById("focus");
const tasksElement = document.getElementById("tasks");

const defaultData = {
    date: today.toISOString().slice(0, 10),

    focus: "Hoàn thành việc quan trọng nhất hôm nay",

    tasks: [
        {
            id: 1,
            title: "Xử lý task công việc quan trọng nhất",
            done: false,
        },
        {
            id: 2,
            title: "Review / kiểm tra phần đã làm",
            done: false,
        },
        {
            id: 3,
            title: "Học Golang 60 phút",
            done: false,
        },
    ],
};
