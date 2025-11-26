var app = new function() {
    this.el = document.getElementById("entries");
    this.activeTab = 'patient';

    // MOCK DATA
    this.patients = [
        { id: 1, first_name: 'John', last_name: 'Doe', dob: '1980-05-15', sex: 'M', city: 'Boston' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', dob: '1992-08-22', sex: 'F', city: 'New York' },
    ];
    this.doctors = [
        { id: 101, first_name: 'Alice', last_name: 'Wong', specialty: 'Oncology', city: 'Boston' },
        { id: 102, first_name: 'Vikram', last_name: 'Singh', specialty: 'Radiology', city: 'New York' }
    ];
    this.cancers = [
        { id: 1, name: 'Lung Cancer', description: 'Cancer that begins in the lungs.', symptoms: 'Coughing' },
        { id: 2, name: 'Melanoma', description: 'Skin cancer.', symptoms: 'Moles' }
    ];
    this.treatments = [
        { id: 1, name: 'Chemotherapy', description: 'Chemical drug treatment.' },
        { id: 2, name: 'Radiation', description: 'High energy waves.' }
    ];
    // New Relationship Data
    this.diagnoses = [
        { id: 1, patient: 1, cancer: 1, date: '2023-01-15' }, // John has Lung Cancer
        { id: 2, patient: 2, cancer: 2, date: '2023-03-20' }  // Jane has Melanoma
    ];
    this.evaluations = [
        { id: 1, doctor: 101, patient: 1 }, // Dr Wong evaluates John
        { id: 2, doctor: 102, patient: 2 }  // Dr Singh evaluates Jane
    ];
    this.cancer_treatments = [
        { id: 1, diagnosis: 1, treatment: 1, current_status: 'P', start_date: '2023-02-01', end_date: '' }
    ];

    // NAVIGATION 
    this.switchTab = function(tabName) {
        this.activeTab = tabName;
        
        // Exact Mapping to fix the UI Bugs (No more fuzzy matching)
        const tabMap = {
            'patient': 'Patients',
            'doctor': 'Doctors',
            'cancer': 'Cancers',
            'treatment': 'Treatments',
            'diagnosis': 'Diagnoses',
            'evaluation': 'Evaluations',
            'cancer_treatment': 'Cancer Treatments'
        };

        let tabs = document.getElementsByClassName('tab-btn');
        for (let t of tabs) {
            t.classList.remove('active');
            if (t.innerText === tabMap[tabName]) {
                t.classList.add('active');
            }
        }
        
        this.fetchAll();
    };

    // READ 
    this.fetchAll = function() {
        var data = "";
        var dataset = this.getDataByTab();
        var headers = this.getHeadersByTab();
        
        // Headers
        let headRow = "<tr>";
        headers.forEach(h => headRow += `<th>${h}</th>`);
        headRow += "<th>Actions</th></tr>";
        document.getElementById("table-head").innerHTML = headRow;

        // Rows
        if (dataset.length > 0) {
            for (let i = 0; i < dataset.length; i++) {
                data += "<tr>";
                let item = dataset[i];
                
                if (this.activeTab === 'patient') {
                    data += `<td>${item.id}</td><td>${item.first_name} ${item.last_name}</td><td>${item.city}</td><td>${item.dob}</td><td>${item.sex}</td>`;
                } else if (this.activeTab === 'doctor') {
                    data += `<td>${item.id}</td><td>${item.first_name} ${item.last_name}</td><td>${item.specialty}</td><td>${item.city}</td>`;
                } else if (this.activeTab === 'cancer' || this.activeTab === 'treatment') {
                    data += `<td>${item.id}</td><td>${item.name}</td><td>${item.description}</td>`;
                } else if (this.activeTab === 'diagnosis') {
                    data += `<td>${item.id}</td><td>Pt ID: ${item.patient}</td><td>Cancer ID: ${item.cancer}</td><td>${item.date}</td>`;
                } else if (this.activeTab === 'evaluation') {
                    data += `<td>${item.id}</td><td>Dr ID: ${item.doctor}</td><td>Pt ID: ${item.patient}</td>`;
                } else if (this.activeTab === 'cancer_treatment') {
                    let status = item.current_status === 'P' ? 'Partial Cure' : (item.current_status === 'C' ? 'Complete' : 'Incomplete');
                    data += `<td>${item.id}</td><td>Diag ID: ${item.diagnosis}</td><td>Tx ID: ${item.treatment}</td><td>${status}</td><td>${item.start_date}</td>`;
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
        if (this.activeTab === 'treatment') return this.treatments;
        if (this.activeTab === 'diagnosis') return this.diagnoses;
        if (this.activeTab === 'evaluation') return this.evaluations;
        if (this.activeTab === 'cancer_treatment') return this.cancer_treatments;
        return [];
    };

    this.getHeadersByTab = function() {
        if (this.activeTab === 'patient') return ['ID', 'Name', 'City', 'DOB', 'Sex'];
        if (this.activeTab === 'doctor') return ['ID', 'Name', 'Specialty', 'City'];
        if (this.activeTab === 'cancer') return ['ID', 'Name', 'Description'];
        if (this.activeTab === 'treatment') return ['ID', 'Name', 'Description'];
        if (this.activeTab === 'diagnosis') return ['ID', 'Patient', 'Cancer', 'Date'];
        if (this.activeTab === 'evaluation') return ['ID', 'Doctor', 'Patient'];
        if (this.activeTab === 'cancer_treatment') return ['ID', 'Diagnosis', 'Treatment', 'Status', 'Start'];
    };

    // --- CREATE & UPDATE ---
    this.openModal = function(mode, index = null) {
        document.getElementById('modal-overlay').style.display = 'block';
        document.getElementById('modal-title').innerText = (mode === 'add' ? 'Add New ' : 'Edit ') + this.activeTab.replace('_', ' ');
        
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
        } else if (this.activeTab === 'cancer' || this.activeTab === 'treatment') {
             html += `<input type="text" id="f_name" placeholder="Name" class="form-input" required>
                      <textarea id="f_desc" placeholder="Description" class="form-input" rows="3"></textarea>`;
             if(this.activeTab === 'cancer') html += `<textarea id="f_symp" placeholder="Symptoms" class="form-input" rows="3"></textarea>`;
        } else if (this.activeTab === 'diagnosis') {
            html += `<input type="number" id="f_pid" placeholder="Patient ID" class="form-input" required>
                     <input type="number" id="f_cid" placeholder="Cancer ID" class="form-input" required>
                     <label>Date:</label><input type="date" id="f_date" class="form-input" required>`;
        } else if (this.activeTab === 'evaluation') {
            html += `<input type="number" id="f_did" placeholder="Doctor ID" class="form-input" required>
                     <input type="number" id="f_pid" placeholder="Patient ID" class="form-input" required>`;
        } else if (this.activeTab === 'cancer_treatment') {
            html += `<input type="number" id="f_diag_id" placeholder="Diagnosis ID" class="form-input" required>
                     <input type="number" id="f_treat_id" placeholder="Treatment ID" class="form-input" required>
                     <select id="f_status" class="form-input"><option value="I">Incomplete</option><option value="P">Partial Cure</option><option value="C">Complete Cure</option></select>
                     <label>Start:</label><input type="date" id="f_start" class="form-input" required>
                     <label>End:</label><input type="date" id="f_end" class="form-input">`;
        }
        container.innerHTML = html;
    };

    this.Add = function() {
        let dataset = this.getDataByTab();
        let item = { id: dataset.length + 100 };
        this.saveToItem(item);
        dataset.push(item);
        this.closeModal();
        this.fetchAll();
    };

    this.saveEdit = function(index) {
        let dataset = this.getDataByTab();
        let item = dataset[index];
        this.saveToItem(item);
        this.closeModal();
        this.fetchAll();
    };

    this.saveToItem = function(item) {
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
        } else if (this.activeTab === 'cancer' || this.activeTab === 'treatment') {
            item.name = document.getElementById('f_name').value;
            item.description = document.getElementById('f_desc').value;
            if(this.activeTab === 'cancer') item.symptoms = document.getElementById('f_symp').value;
        } else if (this.activeTab === 'diagnosis') {
            item.patient = document.getElementById('f_pid').value;
            item.cancer = document.getElementById('f_cid').value;
            item.date = document.getElementById('f_date').value;
        } else if (this.activeTab === 'evaluation') {
            item.doctor = document.getElementById('f_did').value;
            item.patient = document.getElementById('f_pid').value;
        } else if (this.activeTab === 'cancer_treatment') {
            item.diagnosis = document.getElementById('f_diag_id').value;
            item.treatment = document.getElementById('f_treat_id').value;
            item.current_status = document.getElementById('f_status').value;
            item.start_date = document.getElementById('f_start').value;
            item.end_date = document.getElementById('f_end').value;
        }
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
        } else if (this.activeTab === 'cancer' || this.activeTab === 'treatment') {
            document.getElementById('f_name').value = item.name;
            document.getElementById('f_desc').value = item.description;
            if(this.activeTab === 'cancer') document.getElementById('f_symp').value = item.symptoms;
        } else if (this.activeTab === 'diagnosis') {
            document.getElementById('f_pid').value = item.patient;
            document.getElementById('f_cid').value = item.cancer;
            document.getElementById('f_date').value = item.date;
        } else if (this.activeTab === 'evaluation') {
            document.getElementById('f_did').value = item.doctor;
            document.getElementById('f_pid').value = item.patient;
        } else if (this.activeTab === 'cancer_treatment') {
            document.getElementById('f_diag_id').value = item.diagnosis;
            document.getElementById('f_treat_id').value = item.treatment;
            document.getElementById('f_status').value = item.current_status;
            document.getElementById('f_start').value = item.start_date;
            document.getElementById('f_end').value = item.end_date;
        }
    };

    this.Delete = function(index) {
        if(confirm("Delete?")) {
            this.getDataByTab().splice(index, 1);
            this.fetchAll();
        }
    };

    this.Count = function(data) { document.getElementById('counter').innerHTML = data ? data + ' records' : 'No records'; };
    this.closeModal = function() { document.getElementById("modal-overlay").style.display = 'none'; };
    this.updateSearchOptions = function() { document.getElementById('search-criteria').innerHTML = "<option>ID</option>"; };
    this.Search = function() { this.fetchAll(); }; // Simple reset
}

app.switchTab('patient');