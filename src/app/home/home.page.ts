import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder ,Validators,FormControl} from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { CrudService } from '../services/crud.service';
import { resolve } from 'url';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
  public users:any=[];
  public otpForm: FormGroup;
  public time_created:any='';
  observableVar:any;
  error_msg = {
      'email' : [
        { type: 'required', message: 'Enter valid email' },
        { type: 'pattern', message: 'Enter valid email' }
      ]
  }

  constructor( 
                public fb: FormBuilder,
                public toastCtrl: ToastController,
                public crudService: CrudService
            ) {
    this.observableVar = setInterval(() => {
      if(this.users.length>0){
        this.checkOTPLife();
      }
    }, 1000);
    this.otpForm = this.fb.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      otp:'',
      time_created:''
    })
  }

  ngOnInit(){
    this.getUserInfo();
  }

  ionViewDidLeave(){
      clearInterval(this.observableVar);
  }

  checkOTPLife(){
    this.users.filter((item)=>{
      if(item.time_created>0){
        item.time_created = (parseInt(item.time_created)-1);
        this.crudService.updateUserInfo(item);
      } else {
        this.crudService.deleteUser(item.id);
      }
    })
  }

  getUserInfo(){
    this.crudService.getUserInfo().subscribe(res=>{
      this.users = res;
    })
  }

  deleteUserInfo(id){
    this.crudService.deleteUser(id).then(() => {
      
    }, err => {
      this.presentToast('There was a problem deleting your info :(');
    });
  }

  async genOTP(): Promise<void>{
    const newStringForEmail = new String(this.otpForm.value.email);
    var newStringForEmailLength = newStringForEmail.length;
      const checkEmailAlreadyExistOrNot= await this.checkExistence(this.otpForm.value.email);
      if(checkEmailAlreadyExistOrNot!=='exist'){
        if(this.otpForm.value.email!='' && newStringForEmailLength>11){
          var generatedOTP = Math.floor(1000 + Math.random() * 9000);
          this.otpForm.controls['otp'].setValue(generatedOTP);
          this.otpForm.controls['time_created'].setValue('60');
          const record={};
          record['email']=this.otpForm.value.email;
          record['otp']=this.otpForm.value.otp;
          record['time_created']=this.otpForm.value.time_created;
          this.crudService.create_NewUserInfo(record);
        } else {
          this.presentToast('Email should be greater than 11 digits');
        }
      } else {
        this.presentToast('Email already exist in database');
      }
      
  }

  async checkExistence(eamil): Promise<string>{
    return new Promise<string>(resolve=>{
      if(this.users.length>0)
      this.users.filter((item)=>{
        
          if(item.email===eamil){
            resolve('exist');
          }
          resolve('not exist');
        })
      resolve('not exist');
    });
  }

  async presentToast(msg:any){
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

}
