import { Component, Input, OnInit } from '@angular/core';
import { PlanNode } from '../utils/plan';

@Component({
  selector: 'app-plan-node',
  standalone: false,
  templateUrl: './plan-node.component.html',
  styleUrl: './plan-node.component.css'
})
export class PlanNodeComponent implements OnInit {
  @Input() node!: PlanNode;
  @Input() depth = 0;

  collapsed = false;

  ngOnInit(): void {
    this.collapsed = this.depth >= 2;
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }
}
