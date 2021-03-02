import { Component,OnInit,  ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { MiniFile } from './mini-file';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit{
  constructor(private http: HttpClient,private sanitizer: DomSanitizer) { }
 
  Files: Array<File> = new Array<File>();
  InvoiceNumber: string = '';
  Series: string = '';
  CurrentFoto: any = '';//'assets/img/NoFoto.png';
  nameCurrentFoto: string = "sert.jpeg";
  infoText: string = "Введите данные для поиска";
  innerIP:boolean = false;
  miniFiles:Array<MiniFile> = new Array<MiniFile>();
  infoMessage: string = '<<< Выберите файл или нажмите "Скачать"';
  

  title = 'cert-tadeum-by';

  ngOnInit() {
    this.http.get("http://api.ipify.org/?format=json").subscribe((r)=>{
      if(r['ip'] === '37.17.73.110') {
        this.innerIP = true;
      }
    });
    this.http.get("https://jsonip.com/").subscribe((r)=>{
      if(r['ip'] === '37.17.73.110') {
        this.innerIP = true;
      }
    });   
  }

  getFileList() {
    let wsPath: string = this.GetAdressWS() + '/Cert/GetAll?Number=' + this.InvoiceNumber + '&Series=' + this.Series;
    console.log(wsPath);
    this.http.get<Array<File>>(wsPath).subscribe((r)=>{
      this.Files = r;
      this.miniFiles = new Array<MiniFile>();
      r.forEach(curFile => {
        let curMiniFile = new MiniFile();
        curMiniFile.Path = curFile['Path'];
        this.miniFiles.push(curMiniFile)        
      });
      this.CurrentFoto = '';//'assets/img/NoFoto.png'; 
      this.nameCurrentFoto = '';
      this.infoText = '';
    },
    (error) => {                              
      this.infoText = error.error;
    });
    this.infoMessage = '<<< Выберите файл или нажмите "Скачать"';
  }

  GetAdressWS():string{
    if(this.innerIP){
      return environment.innerWS;
    } else{
      return environment.ws;
    }
  }

  setCurrentFoto(curFile){
    if (curFile.FileBase64 === undefined){
      curFile.FileBase64 = '';
    }

    if (curFile.FileBase64 === '') {
      let wsPath: string = this.GetAdressWS() + '/Cert/GetAll?Number=' + this.InvoiceNumber + '&Series=' + this.Series;
      let curMiniFile: MiniFile = new MiniFile();
      curMiniFile.Path = curFile.Path;

      this.http.post<string>(wsPath,JSON.stringify(curMiniFile)).subscribe((r)=>{
        curFile.FileBase64 = r;
        this.CurrentFoto = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + decodeURIComponent(curFile.FileBase64));
        this.nameCurrentFoto = curFile.Name + '.jpg';
    });  
      
    } else{
      this.CurrentFoto = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + decodeURIComponent(curFile.FileBase64));
      this.nameCurrentFoto = curFile.Name + '.jpg';
    }
    this.infoMessage = '<<< Выберите файл или нажмите "Скачать"';
  }

  getCurrentFoto():any{
    if(this.CurrentFoto === '')
      return 'assets/img/NoFoto.png'; 
    else
      return this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + decodeURIComponent(this.CurrentFoto));
  }

  getAllFoto():any{
    let wsPath: string = this.GetAdressWS() + '/Cert/GetAll?Number=' + this.InvoiceNumber + '&Series=' + this.Series;
    
    const headers = new HttpHeaders();
    this.http.post(wsPath,JSON.stringify(this.miniFiles),{headers, responseType: 'blob' as 'json'}).subscribe((r)=>{
      let dataType = r['type'];
      let binaryData = [];
      binaryData.push(r);
      let downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: dataType }));
      downloadLink.setAttribute('download', this.Series + this.InvoiceNumber + '.zip');
      document.body.appendChild(downloadLink);
      downloadLink.click();
    });  
  }

  isOk(){
    return this.infoText === '';
  }

  isOkFoto(){
    return this.CurrentFoto != '';
  }

  isNotOk(){
    return this.infoText != '';
  }

  isNotOkFoto(){
    return this.CurrentFoto === '';
  }

  DownloadLink() {
    return this.GetAdressWS() + '/Cert/GetAll?Number=' + this.InvoiceNumber + '&Series=' + this.Series + '&Zip=true';
  }

  StartDownloading() {
    this.CurrentFoto = '';
    this.infoMessage = "Идет подготовка файла, скачивание начнется автоматически ...";
  }
}
