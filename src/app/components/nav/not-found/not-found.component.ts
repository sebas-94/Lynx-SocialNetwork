import { Component, OnInit } from '@angular/core';

// Routing
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {


  constructor(public route: ActivatedRoute) { }

  ngOnInit(): void {

  }

}
