document.addEventListener('DOMContentLoaded', function() {
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');

    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', function(event) {
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-content').forEach(content => {
                if (content !== this.nextElementSibling) {
                    content.classList.remove('show');
                }
            });

            // Toggle the clicked dropdown
            this.nextElementSibling.classList.toggle('show');
            event.stopPropagation();
        });
    });

    // Close dropdowns if clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-btn')) {
            document.querySelectorAll('.dropdown-content').forEach(content => {
                content.classList.remove('show');
            });
        }
    });
});
