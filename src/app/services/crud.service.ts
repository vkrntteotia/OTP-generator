import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface USERINFO {
  id?: string,
  email: string,
  otp: string,
  time_created: string
}

@Injectable({
  providedIn: 'root'
})

export class CrudService {
  private users: Observable<USERINFO[]>;
  private userCollection: AngularFirestoreCollection<USERINFO>;
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private database: AngularFirestore,
  ) { 
    this.userCollection = this.firestore.collection('userInfo');
    this.users = this.userCollection.
    snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  getUserInfo(): Observable<USERINFO[]> {
    return this.users;
  }

  deleteUser(id: string): Promise<void> {
    return this.userCollection.doc(id).delete();
  }

  updateUserInfo(user: USERINFO): Promise<void> {
    return this.userCollection.doc(user.id).update({ time_created: user.time_created });
  }

  create_NewUserInfo(record) {
    return this.firestore.collection('userInfo').add(record);
  }

}

