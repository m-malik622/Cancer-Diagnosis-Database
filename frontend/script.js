var app = new function() {
    this.el = document.getElementById("entries");
    this.activeTab = 'patient';
    const BASE_URL = 'http://127.0.0.1:8000';
    this.currentData = []; 

    this.cache = {
        patients: {},
        doctors: {},
        cancers: {},
        treatments: {},
        diagnoses: {} 
    };

    this.initCache = function() {
        Promise.all([
            fetch(BASE_URL + '/get_patients').then(r => r.json()),
            fetch(BASE_URL + '/get_doctors').then(r => r.json()),
            fetch(BASE_URL + '/get_cancers').then(r => r.json()),
            fetch(BASE_URL + '/get_treatments').then(r => r.json()),
            fetch(BASE_URL + '/get_diagnoses').then(r => r.json())
        ]).then(([pData, dData, cData, tData, diagData]) => {
            
            // 1. Process Patients
            let pList = pData.patient || [];
            pList.forEach(p => this.cache.patients[p.id] = `${p.first_name} ${p.last_name}`);

            // 2. Process Doctors
            let dList = dData.doctors || [];
            dList.forEach(d => this.cache.doctors[d.id] = `Dr. ${d.last_name}`);

            // 3. Process Cancers 
            let cList = cData || [];
            cList.forEach(c => this.cache.cancers[c.id] = c.name);

            // 4. Process Treatments 
            let tList = tData || [];
            tList.forEach(t => this.cache.treatments[t.id] = t.name);

            // 5. Process Diagnoses 
            let diagList = diagData.diagnoses || [];
            diagList.forEach(d => {
                let pName = this.cache.patients[d.patient_id] || d.patient_id;
                let cName = this.cache.cancers[d.cancer_id] || d.cancer_id;
                this.cache.diagnoses[d.id] = `${pName} (${cName})`;
            });

            if(['diagnosis', 'evaluation', 'cancer_treatment'].includes(this.activeTab)) {
                this.renderTable(this.currentData);
            }
        }).catch(e => console.log("Cache load error (Server might be off):", e));
    };

    // --- NAVIGATION ---
    this.switchTab = function(tabName) {
        this.activeTab = tabName;
        localStorage.setItem('activeTab', tabName);

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
            if (t.innerText === tabMap[tabName]) t.classList.add('active');
        }
        
        this.updateSearchOptions();
        this.fetchAll();
    };

    // --- READ (GET) ---
    this.fetchAll = function() {
        // Special URL handling
        let plural = this.activeTab === 'cancer_treatment' ? 'cancerTreatments' : this.activeTab + 's';
        if (this.activeTab === 'diagnosis') plural = 'diagnoses'; 
        
        let endpoint = `/get_${plural}`;
        
        fetch(BASE_URL + endpoint)
            .then(res => { if (!res.ok) throw new Error("Server Error"); return res.json(); })
            .then(data => {
                let validData = [];
                if (this.activeTab === 'patient') validData = data.patient || [];
                else if (this.activeTab === 'doctor') validData = data.doctors || [];
                else if (this.activeTab === 'cancer') validData = data || [];
                else if (this.activeTab === 'treatment') validData = data || [];
                else if (this.activeTab === 'diagnosis') validData = data.diagnoses || [];
                else if (this.activeTab === 'evaluation') validData = data.evaluations || [];
                else if (this.activeTab === 'cancer_treatment') validData = data.cancerTreatments || [];

                this.currentData = validData;
                this.renderTable(validData);
            })
            .catch(err => this.el.innerHTML = `<tr><td colspan="10" style="text-align:center; color:red;">${err.message}</td></tr>`);
    };

    this.renderTable = function(data) {
        var rows = "";
        let headers = [];

        if (this.activeTab === 'patient') headers = ['ID', 'Name', 'City', 'DOB', 'Sex'];
        else if (this.activeTab === 'doctor') headers = ['ID', 'Name', 'Specialty', 'City'];
        else if (this.activeTab === 'cancer') headers = ['ID', 'Name', 'Description', 'Symptoms'];
        else if (this.activeTab === 'treatment') headers = ['ID', 'Name', 'Description'];
        else if (this.activeTab === 'diagnosis') headers = ['ID', 'Patient', 'Cancer'];
        else if (this.activeTab === 'evaluation') headers = ['ID', 'Doctor', 'Patient'];
        else if (this.activeTab === 'cancer_treatment') headers = ['ID', 'Diagnosis', 'Treatment', 'Status', 'End Date'];
        
        let headRow = "<tr>";
        headers.forEach(h => headRow += `<th>${h}</th>`);
        headRow += "<th>Actions</th></tr>";
        document.getElementById("table-head").innerHTML = headRow;

        if (data.length > 0) {
            data.forEach((item) => {
                rows += "<tr>";
                
                if (this.activeTab === 'patient') {
                    rows += `<td>${item.id}</td><td>${item.first_name} ${item.last_name}</td><td>${item.city_of_residence}</td><td>${app.formatDate(item.date_of_birth)}</td><td>${item.sex}</td>`;
                } else if (this.activeTab === 'doctor') {
                    rows += `<td>${item.id}</td><td>${item.first_name} ${item.last_name}</td><td>${item.specialty}</td><td>${item.city_of_practice}</td>`;
                } else if (this.activeTab === 'cancer') {
                    rows += `<td>${item.id}</td><td>${item.name}</td><td>${item.description}</td><td>${item.symptoms}</td>`;
                } else if (this.activeTab === 'treatment') {
                    rows += `<td>${item.id}</td><td>${item.name}</td><td>${item.description}</td>`;
                } else if (this.activeTab === 'diagnosis') {
                    let pName = this.cache.patients[item.patient_id] || `ID: ${item.patient_id}`;
                    let cName = this.cache.cancers[item.cancer_id] || `ID: ${item.cancer_id}`;
                    rows += `<td>${item.id}</td><td>${pName}</td><td>${cName}</td>`;
                } else if (this.activeTab === 'evaluation') {
                    let dName = this.cache.doctors[item.doctor_id] || `ID: ${item.doctor_id}`;
                    let pName = this.cache.patients[item.patient_id] || `ID: ${item.patient_id}`;
                    rows += `<td>${item.id}</td><td>${dName}</td><td>${pName}</td>`;
                } else if (this.activeTab === 'cancer_treatment') {
                    let diagName = this.cache.diagnoses[item.diagnosis_id] || `Diag ID: ${item.diagnosis_id}`;
                    let tName = this.cache.treatments[item.treatment_id] || `ID: ${item.treatment_id}`;
                    let statusMap = { 'I': 'Incomplete', 'P': 'Partial Cure', 'C': 'Complete Cure' };
                    let statusDisplay = statusMap[item.current_status] || item.current_status;
                    rows += `<td>${item.id}</td><td>${diagName}</td><td>${tName}</td><td>${statusDisplay}</td><td>${app.formatDate(item.end_date)}</td>`;
                }
                
                // --- ACTION BUTTONS ---
                rows += `<td>`;
                if(['patient','doctor','cancer','treatment', 'cancer_treatment'].includes(this.activeTab)) {
                    rows += `<button onclick="app.openModal('edit', ${item.id})" class="btn btn-warning">Edit</button> `;
                }
                if (this.activeTab !== 'cancer_treatment') {
                    rows += `<button onclick="app.Delete(${item.id})" class="btn btn-danger">Delete</button>`;
                }
                rows += `</td></tr>`;
            });
        } else {
            rows = `<tr><td colspan="10" style="text-align:center;">No records found.</td></tr>`;
        }
        this.Count(data.length);
        this.el.innerHTML = rows;
    };

    // --- ADD (POST) ---
    this.Add = function() {
        let formData = this.getFormData();
        let endpoint = `/create_${this.activeTab}`;
        if (this.activeTab === 'cancer_treatment') endpoint = '/add_cancerTreatment';
        
        fetch(BASE_URL + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        }).then(res => { 
            if(res.ok) { 
                this.closeModal(); 
                this.initCache(); // Reload names in case a new one was added
                this.fetchAll(); 
            } else alert("Error creating."); 
        });
    };

    // --- EDIT (PUT) ---
    this.saveEdit = function(id) {
        let formData = this.getFormData();
        let endpoint = `/update_${this.activeTab}/${id}`;
        if (this.activeTab === 'cancer_treatment') endpoint = `/update_cancerTreatment/${id}`;

        fetch(BASE_URL + endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        }).then(res => { 
            if(res.ok) { 
                this.closeModal(); 
                this.initCache(); 
                this.fetchAll(); 
            } else alert("Error updating."); 
        });
    };

    // --- DELETE (GET) ---
    this.Delete = function(id) {
        if (confirm("Delete this?")) {
            let endpoint = `/delete_${this.activeTab}/${id}`;
            if (this.activeTab === 'diagnosis') endpoint = `/remove_diagnosis/${id}`;
            if (this.activeTab === 'evaluation') endpoint = `/remove_evaluation/${id}`;

            fetch(BASE_URL + endpoint).then(res => { if(res.ok) this.fetchAll(); else alert("Error deleting."); });
        }
    };

    this.getFormData = function() {
        let data = {};
        if (this.activeTab === 'patient') {
            data.first_name = document.getElementById('f_fname').value;
            data.last_name = document.getElementById('f_lname').value;
            data.date_of_birth = document.getElementById('f_dob').value;
            data.sex = document.getElementById('f_sex').value;
            data.city_of_residence = document.getElementById('f_city').value;
        } else if (this.activeTab === 'doctor') {
            data.first_name = document.getElementById('f_fname').value;
            data.last_name = document.getElementById('f_lname').value;
            data.specialty = document.getElementById('f_spec').value;
            data.city_of_practice = document.getElementById('f_city').value;
        } else if (this.activeTab === 'cancer') {
            data.name = document.getElementById('f_name').value;
            data.description = document.getElementById('f_desc').value;
            data.symptoms = document.getElementById('f_symp').value;
        } else if (this.activeTab === 'treatment') {
            data.name = document.getElementById('f_name').value;
            data.description = document.getElementById('f_desc').value;
        } 
        else if (this.activeTab === 'diagnosis') {
            data.patient_id = document.getElementById('f_pid').value;
            data.cancer_id = document.getElementById('f_cid').value;
        } else if (this.activeTab === 'evaluation') {
            data.doctor_id = document.getElementById('f_did').value;
            data.patient_id = document.getElementById('f_pid').value;
        } else if (this.activeTab === 'cancer_treatment') {
            data.diagnosis_id = document.getElementById('f_did').value;
            data.treatment_id = document.getElementById('f_tid').value;
            data.current_status = document.getElementById('f_status').value;
            data.end_date = document.getElementById('f_end').value || null;
        }
        return data;
    };

    this.openModal = function(mode, id = null) {
        document.getElementById('modal-overlay').style.display = 'block';
        document.getElementById('modal-title').innerText = (mode === 'add' ? 'Add ' : 'Edit ') + this.activeTab;
        
        let container = document.getElementById('dynamic-form-fields');
        let html = '';

        const createOptions = (cacheObj, selectedId) => {
            let opts = '<option value="">Select...</option>';
            for (let [key, name] of Object.entries(cacheObj)) {
                opts += `<option value="${key}">${name} (ID: ${key})</option>`;
            }
            return opts;
        };

        if (this.activeTab === 'patient') {
            html = `<input type="text" id="f_fname" placeholder="First Name" class="form-input" required>
                    <input type="text" id="f_lname" placeholder="Last Name" class="form-input" required>
                    <label>DOB:</label><input type="date" id="f_dob" class="form-input" required>
                    <select id="f_sex" class="form-input"><option value="M">Male</option><option value="F">Female</option></select>
                    <input type="text" id="f_city" placeholder="City" class="form-input" required>`;
        } else if (this.activeTab === 'doctor') {
            html = `<input type="text" id="f_fname" placeholder="First Name" class="form-input" required>
                    <input type="text" id="f_lname" placeholder="Last Name" class="form-input" required>
                    <input type="text" id="f_spec" placeholder="Specialty" class="form-input" required>
                    <input type="text" id="f_city" placeholder="City" class="form-input" required>`;
        } else if (this.activeTab === 'cancer') {
            html = `<input type="text" id="f_name" placeholder="Name" class="form-input" required>
                    <textarea id="f_desc" placeholder="Description" class="form-input"></textarea>
                    <textarea id="f_symp" placeholder="Symptoms" class="form-input"></textarea>`;
        } else if (this.activeTab === 'treatment') {
            html = `<input type="text" id="f_name" placeholder="Name" class="form-input" required>
                    <textarea id="f_desc" placeholder="Description" class="form-input"></textarea>`;
        } else if (this.activeTab === 'diagnosis') {
            html = `<label>Patient:</label>
                    <select id="f_pid" class="form-input" required>${createOptions(this.cache.patients)}</select>
                    <label>Cancer:</label>
                    <select id="f_cid" class="form-input" required>${createOptions(this.cache.cancers)}</select>`;
        } else if (this.activeTab === 'evaluation') {
            html = `<label>Doctor:</label>
                    <select id="f_did" class="form-input" required>${createOptions(this.cache.doctors)}</select>
                    <label>Patient:</label>
                    <select id="f_pid" class="form-input" required>${createOptions(this.cache.patients)}</select>`;
        } else if (this.activeTab === 'cancer_treatment') {
            html = `<label>Diagnosis:</label>
                    <select id="f_did" class="form-input" required>${createOptions(this.cache.diagnoses)}</select>
                    <label>Treatment:</label>
                    <select id="f_tid" class="form-input" required>${createOptions(this.cache.treatments)}</select>
                    <label>Status:</label>
                    <select id="f_status" class="form-input"><option value="I">Incomplete</option><option value="P">Partial</option><option value="C">Complete</option></select>
                    <label>End Date:</label><input type="datetime-local" id="f_end" class="form-input">`;
        }
        
        container.innerHTML = html;

        // POPULATE FOR EDITING
        if (mode === 'edit' && id !== null) {
            let item = this.currentData.find(x => x.id === id);
            if (item) {
                // Populate Logic
                if (this.activeTab === 'patient') {
                    document.getElementById('f_fname').value = item.first_name;
                    document.getElementById('f_lname').value = item.last_name;
                    document.getElementById('f_dob').value = item.date_of_birth;
                    document.getElementById('f_sex').value = item.sex;
                    document.getElementById('f_city').value = item.city_of_residence;
                } else if (this.activeTab === 'doctor') {
                    document.getElementById('f_fname').value = item.first_name;
                    document.getElementById('f_lname').value = item.last_name;
                    document.getElementById('f_spec').value = item.specialty;
                    document.getElementById('f_city').value = item.city_of_practice;
                } else if (this.activeTab === 'cancer' || this.activeTab === 'treatment') {
                    document.getElementById('f_name').value = item.name;
                    document.getElementById('f_desc').value = item.description;
                    if(this.activeTab === 'cancer') document.getElementById('f_symp').value = item.symptoms;
                } else if (this.activeTab === 'diagnosis') {
                    document.getElementById('f_pid').value = item.patient_id;
                    document.getElementById('f_cid').value = item.cancer_id;
                } else if (this.activeTab === 'evaluation') {
                    document.getElementById('f_did').value = item.doctor_id;
                    document.getElementById('f_pid').value = item.patient_id;
                } else if (this.activeTab === 'cancer_treatment') {
                    document.getElementById('f_did').value = item.diagnosis_id;
                    document.getElementById('f_tid').value = item.treatment_id;
                    document.getElementById('f_status').value = item.current_status;
                    document.getElementById('f_end').value = item.end_date;
                }
                document.getElementById('modal-form').onsubmit = () => { this.saveEdit(id); };
            }
        } else {
            document.getElementById('modal-form').onsubmit = () => { this.Add(); };
        }
    };

     this.formatDate = function(dateString) {
        if (!dateString) return '-';
        // Fix for timezone issues: append 'T00:00' if it's just a date
        let date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00');
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    this.Count = function(data) { document.getElementById('counter').innerHTML = data ? data + ' records' : 'No records'; };
    this.closeModal = function() { document.getElementById("modal-overlay").style.display = 'none'; };
    this.updateSearchOptions = function() {
        let select = document.getElementById('search-criteria');
        let options = [];

        if (this.activeTab === 'patient') options = ['ID', 'Name', 'City', 'DOB', 'Sex'];
        else if (this.activeTab === 'doctor') options = ['ID', 'Name', 'Specialty', 'City'];
        else if (this.activeTab === 'cancer') options = ['ID', 'Name', 'Description', 'Symptoms'];
        else if (this.activeTab === 'treatment') options = ['ID', 'Name', 'Description'];
        else if (this.activeTab === 'diagnosis') options = ['ID', 'Patient', 'Cancer'];
        else if (this.activeTab === 'evaluation') options = ['ID', 'Doctor', 'Patient'];
        else if (this.activeTab === 'cancer_treatment') options = ['ID', 'Diagnosis', 'Treatment', 'Status', 'End Date'];

        let html = "";
        options.forEach(opt => {
            html += `<option value="${opt}">${opt}</option>`;
        });
        select.innerHTML = html;
    };

    // --- SORT FUNCTIONALITY ---
    this.Sort = function() {
        let criteria = document.getElementById('search-criteria').value;
        
        this.currentData.sort((a, b) => {
            let valA = '', valB = '';

            // 1. PATIENTS
            if (this.activeTab === 'patient') {
                if (criteria === 'ID') { valA = a.id; valB = b.id; }
                else if (criteria === 'Name') { valA = a.first_name.toLowerCase(); valB = b.first_name.toLowerCase(); }
                else if (criteria === 'City') { valA = a.city_of_residence.toLowerCase(); valB = b.city_of_residence.toLowerCase(); }
                else if (criteria === 'DOB') { valA = a.date_of_birth; valB = b.date_of_birth; }
                else if (criteria === 'Sex') { valA = a.sex; valB = b.sex; }
            }
            // 2. DOCTORS
            else if (this.activeTab === 'doctor') {
                if (criteria === 'ID') { valA = a.id; valB = b.id; }
                else if (criteria === 'Name') { valA = a.first_name.toLowerCase(); valB = b.first_name.toLowerCase(); }
                else if (criteria === 'Specialty') { valA = a.specialty.toLowerCase(); valB = b.specialty.toLowerCase(); }
                else if (criteria === 'City') { valA = a.city_of_practice.toLowerCase(); valB = b.city_of_practice.toLowerCase(); }
            }
            // 3. CANCERS & TREATMENTS
            else if (['cancer', 'treatment'].includes(this.activeTab)) {
                if (criteria === 'ID') { valA = a.id; valB = b.id; }
                else if (criteria === 'Name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
                else if (criteria === 'Description') { valA = a.description.toLowerCase(); valB = b.description.toLowerCase(); }
            }
            // 4. DIAGNOSES 
            else if (this.activeTab === 'diagnosis') {
                if (criteria === 'ID') { valA = a.id; valB = b.id; }
                else if (criteria === 'Patient') { 
                    valA = (this.cache.patients[a.patient_id] || '').toLowerCase(); 
                    valB = (this.cache.patients[b.patient_id] || '').toLowerCase(); 
                } else if (criteria === 'Cancer') { 
                    valA = (this.cache.cancers[a.cancer_id] || '').toLowerCase(); 
                    valB = (this.cache.cancers[b.cancer_id] || '').toLowerCase(); 
                }
            }
            // 5. EVALUATIONS
            else if (this.activeTab === 'evaluation') {
                if (criteria === 'ID') { valA = a.id; valB = b.id; }
                else if (criteria === 'Doctor') { 
                    valA = (this.cache.doctors[a.doctor_id] || '').toLowerCase(); 
                    valB = (this.cache.doctors[b.doctor_id] || '').toLowerCase(); 
                } else if (criteria === 'Patient') { 
                    valA = (this.cache.patients[a.patient_id] || '').toLowerCase(); 
                    valB = (this.cache.patients[b.patient_id] || '').toLowerCase(); 
                }
            }
            // 6. CANCER TREATMENTS
            else if (this.activeTab === 'cancer_treatment') {
                if (criteria === 'ID') { valA = a.id; valB = b.id; }
                else if (criteria === 'Status') { valA = a.current_status; valB = b.current_status; }
                else if (criteria === 'Diagnosis') { 
                    valA = (this.cache.diagnoses[a.diagnosis_id] || '').toLowerCase(); 
                    valB = (this.cache.diagnoses[b.diagnosis_id] || '').toLowerCase(); 
                } else if (criteria === 'Treatment') { 
                    valA = (this.cache.treatments[a.treatment_id] || '').toLowerCase(); 
                    valB = (this.cache.treatments[b.treatment_id] || '').toLowerCase(); 
                }
            }
            if (valA < valB) return -1;
            if (valA > valB) return 1;
            return 0;
        });

        this.renderTable(this.currentData);
    };
}

app.initCache();

let savedTab = localStorage.getItem('activeTab') || 'patient';
app.switchTab(savedTab);
app.updateSearchOptions();