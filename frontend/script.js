var app = new function() {
    this.el = document.getElementById("entries");
    this.activeTab = 'patient';

    // --- MOCK DATA ---
    this.patients = [
        { id: 1, first_name: 'John', last_name: 'Doe', dob: '1980-05-15', sex: 'M', city: 'Boston' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', dob: '1992-08-22', sex: 'F', city: 'New York' },
        { id: 3, first_name: 'Robert', last_name: 'Brown', dob: '1975-11-03', sex: 'M', city: 'Chicago' }
    ];

    this.doctors = [
        { id: 101, first_name: 'Alice', last_name: 'Wong', specialty: 'Oncology', city: 'Boston' },
        { id: 102, first_name: 'Vikram', last_name: 'Singh', specialty: 'Radiology', city: 'New York' }
    ];

    this.cancers = [
        { id: 1, name: 'Lung Cancer', description: 'Cancer that begins in the lungs.', symptoms: 'Coughing, Chest pain' },
        { id: 2, name: 'Melanoma', description: 'The most serious type of skin cancer.', symptoms: 'Unusual moles, sores' }
    ];

    this.treatments = [
        { id: 1, name: 'Chemotherapy', description: 'Drug treatment that uses powerful chemicals.' },
        { id: 2, name: 'Radiation', description: 'Uses high doses of radiation to kill cancer cells.' }
    ];

    //READ FUNCTIONALITY 
    this.switchTab = function(tabName) {
        this.activeTab = tabName;
        let tabs = document.getElementsByClassName('tab-btn');
        for (let t of tabs) {
            t.classList.remove('active');
            if (t.innerText.toLowerCase().includes(tabName)) t.classList.add('active');
            if (tabName === 'patient' && t.innerText === 'Patients') t.classList.add('active');
        }
        this.updateSearchOptions();
        this.fetchAll();
    };

    this.fetchAll = function() {
        var data = "";
        var dataset = this.getDataByTab();
        var headers = this.getHeadersByTab();
        
        // Render Headers
        let headRow = "<tr>";
        headers.forEach(h => headRow += `<th>${h}</th>`);
        headRow += "<th>Actions</th></tr>";
        document.getElementById("table-head").innerHTML = headRow;

        // Render Rows
        if (dataset.length > 0) {
            for (let i = 0; i < dataset.length; i++) {
                data += "<tr>";
                let item = dataset[i];
                
                if (this.activeTab === 'patient') {
                    data += `<td>${item.id}</td><td>${item.first_name} ${item.last_name}</td><td>${item.city}</td><td>${item.dob}</td><td>${item.sex}</td>`;
                } else if (this.activeTab === 'doctor') {
                    data += `<td>${item.id}</td><td>${item.first_name} ${item.last_name}</td><td>${item.specialty}</td><td>${item.city}</td>`;
                } else {
                    data += `<td>${item.id}</td><td>${item.name}</td><td>${item.description.substring(0,30)}...</td>`;
                }
                data += `<td>
                            <button onclick="app.openModal('edit', ${i})" class="btn btn-warning">Edit</button>
                            <button onclick="app.Delete(${i})" class="btn btn-danger">Delete</button>
                        </td>`;
                data += "</tr>";
            }
        }
        
        this.Count(dataset.length);
        this.el.innerHTML = data;
    };

    this.getDataByTab = function() {
        if (this.activeTab === 'patient') return this.patients;
        if (this.activeTab === 'doctor') return this.doctors;
        if (this.activeTab === 'cancer') return this.cancers;
        return this.treatments;
    };

    this.getHeadersByTab = function() {
        if (this.activeTab === 'patient') return ['ID', 'Name', 'City', 'Date of Birth', 'Sex'];
        if (this.activeTab === 'doctor') return ['ID', 'Name', 'Specialty', 'City'];
        return ['ID', 'Name', 'Description'];
    };

    // --- CREATE & UPDATE ---
    this.openModal = function(mode, index = null) {
        document.getElementById('modal-overlay').style.display = 'block';
        document.getElementById('modal-title').innerText = (mode === 'add' ? 'Add New ' : 'Edit ') + this.activeTab;
        
        this.generateFormFields();

        if (mode === 'edit' && index !== null) {
            let item = this.getDataByTab()[index];
            this.populateForm(item);
            document.getElementById('modal-form').onsubmit = () => { this.saveEdit(index); };
        } else {
            document.getElementById('modal-form').onsubmit = () => { this.Add(); };
        }
    };

    this.generateFormFields = function() {
        let container = document.getElementById('dynamic-form-fields');
        let html = '';
        
        // CHANGED: Classes updated to match custom CSS (.form-input)
        if (this.activeTab === 'patient') {
            html += `<input type="text" id="f_fname" placeholder="First Name" class="form-input" required>
                     <input type="text" id="f_lname" placeholder="Last Name" class="form-input" required>
                     <input type="date" id="f_dob" class="form-input" required>
                     <select id="f_sex" class="form-input"><option value="M">Male</option><option value="F">Female</option></select>
                     <input type="text" id="f_city" placeholder="City" class="form-input" required>`;
        } else if (this.activeTab === 'doctor') {
            html += `<input type="text" id="f_fname" placeholder="First Name" class="form-input" required>
                     <input type="text" id="f_lname" placeholder="Last Name" class="form-input" required>
                     <input type="text" id="f_spec" placeholder="Specialty" class="form-input" required>
                     <input type="text" id="f_city" placeholder="City" class="form-input" required>`;
        } else {
            html += `<input type="text" id="f_name" placeholder="Name" class="form-input" required>
                     <textarea id="f_desc" placeholder="Description" class="form-input" rows="3"></textarea>`;
        }
        container.innerHTML = html;
    };

    this.Add = function() {
        let dataset = this.getDataByTab();
        let newItem = { id: dataset.length + 100 };

        if (this.activeTab === 'patient') {
            newItem.first_name = document.getElementById('f_fname').value;
            newItem.last_name = document.getElementById('f_lname').value;
            newItem.dob = document.getElementById('f_dob').value;
            newItem.sex = document.getElementById('f_sex').value;
            newItem.city = document.getElementById('f_city').value;
        } else if (this.activeTab === 'doctor') {
            newItem.first_name = document.getElementById('f_fname').value;
            newItem.last_name = document.getElementById('f_lname').value;
            newItem.specialty = document.getElementById('f_spec').value;
            newItem.city = document.getElementById('f_city').value;
        } else {
            newItem.name = document.getElementById('f_name').value;
            newItem.description = document.getElementById('f_desc').value;
        }

        dataset.push(newItem);
        this.closeModal();
        this.fetchAll();
    };

    this.populateForm = function(item) {
        if (this.activeTab === 'patient') {
            document.getElementById('f_fname').value = item.first_name;
            document.getElementById('f_lname').value = item.last_name;
            document.getElementById('f_dob').value = item.dob;
            document.getElementById('f_sex').value = item.sex;
            document.getElementById('f_city').value = item.city;
        } else if (this.activeTab === 'doctor') {
            document.getElementById('f_fname').value = item.first_name;
            document.getElementById('f_lname').value = item.last_name;
            document.getElementById('f_spec').value = item.specialty;
            document.getElementById('f_city').value = item.city;
        } else {
            document.getElementById('f_name').value = item.name;
            document.getElementById('f_desc').value = item.description;
        }
    };

    this.saveEdit = function(index) {
        let dataset = this.getDataByTab();
        let item = dataset[index];

        if (this.activeTab === 'patient') {
            item.first_name = document.getElementById('f_fname').value;
            item.last_name = document.getElementById('f_lname').value;
            item.dob = document.getElementById('f_dob').value;
            item.sex = document.getElementById('f_sex').value;
            item.city = document.getElementById('f_city').value;
        } else if (this.activeTab === 'doctor') {
            item.first_name = document.getElementById('f_fname').value;
            item.last_name = document.getElementById('f_lname').value;
            item.specialty = document.getElementById('f_spec').value;
            item.city = document.getElementById('f_city').value;
        } else {
            item.name = document.getElementById('f_name').value;
            item.description = document.getElementById('f_desc').value;
        }

        this.closeModal();
        this.fetchAll();
    };

    this.Delete = function(index) {
        if(confirm("Are you sure you want to delete this?")) {
            this.getDataByTab().splice(index, 1);
            this.fetchAll();
        }
    };

    this.Count = function(data) {
        var el = document.getElementById('counter');
        if (data) {
            el.innerHTML = data + ' ' + this.activeTab + (data > 1 ? 's' : '');
        } else {
            el.innerHTML = 'No ' + this.activeTab + 's';
        }
    };

    this.closeModal = function() {
        document.getElementById("modal-overlay").style.display = 'none';
    };

    this.updateSearchOptions = function() {
        let select = document.getElementById('search-criteria');
        let options = "";
        if (this.activeTab === 'patient') {
            options = "<option>ID</option><option>Last Name</option><option>City</option>";
        } else if (this.activeTab === 'doctor') {
            options = "<option>ID</option><option>Last Name</option><option>Specialty</option>";
        } else {
            options = "<option>ID</option><option>Name</option>";
        }
        select.innerHTML = options;
    };
    
    this.Search = function() {
        let term = document.getElementById('search-input').value.toLowerCase();
        if(!term) { this.fetchAll(); return; }
        
        let dataset = this.getDataByTab();
        let filtered = dataset.filter(item => {
            return Object.values(item).some(val => String(val).toLowerCase().includes(term));
        });
        
        let temp = this.getDataByTab; 
        this.getDataByTab = function() { return filtered; }
        this.fetchAll();
        this.getDataByTab = temp; 
    };
}

app.switchTab('patient');