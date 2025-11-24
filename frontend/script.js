var app= new function(){
    this.el= document.getElementById("entries");
    this.entries=[];
    // line above is the placeholder, there won't be a database  with no entries

//read
    this.fetchAll = function(){
        var data="";
        if(this.entries.length>0){
            for(i=0;i<this.entries.length;i++){
                data+="<tr>";
                data += '<td>'+ (i + 1) + '. ' + this.entries[i] + '</td>';
                data+='<td><button onclick="app.Edit(' + i + ')" class="btn btn-warning"> Edit</button></td> ';
                data+='<td><button onclick="app.Delete(' + i + ')" class = "btn btn-danger"> Delete</button></td> ';
                data +="</tr>";
            }
        }
        this.Count(this.entries.length);
        this.el.innerHTML = data;
};

//Creates
    this.Add = function(){
        let el = document.getElementById('add-todo');
        //grabs value
        let entry = el.value;
        if(entry){
            this.entries.push(entry.trim());
            el.value ='';
            this.fetchAll();
        }
    };
//update
    this.Edit = function(item){
        let el = document.getElementById('edit-data');
        el.value = this.entries[item];

        document.getElementById('edit-box').style.display = 'block';
        let self = this;
        document.getElementById('save-edit').onsubmit = function(){
            let entry = el.value;
            if (entry){
                self.tasks.splice(item, 1, entry.trim())
                self.fetchAll();
                CloseInput();
            }
        }

    };
//Delete
    this.Delete = function(item){
        this.entries.splice(item,1);
        this.fetchAll();
        };

    this.Count= function(data){
        var el = document.getElementById('counter');
        var name = 'Entries';
        if(data){
            if(data==1){
                name = 'Entries';
            }
            el.innerHTML = data+ '' +name;
        } 
        else{
        el.innerHTML = "No " + name;
        }
    };
}

app.fetchAll();

//being able to close the edit box outside of our function!
function CloseInput(){
    document.getElementById("edit-box").style.display = 'none';

}