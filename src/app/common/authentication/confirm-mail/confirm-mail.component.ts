import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-confirm-mail',
    imports: [RouterLink, MatButtonModule],
    templateUrl: './confirm-mail.component.html',
    styleUrls: ['./confirm-mail.component.scss']
})
export class ConfirmMailComponent {

    constructor() {}

}