import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-advice-content',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './advice-content.component.html',
    styleUrl: './advice-content.component.scss'
})
export class AdviceContentComponent {
    // Inputs pour le conseil
    advice = input<string>('');
    adviceIcon = input<string>('');
    adviceIconColor = input<string>('');

    // Inputs pour les avantages
    whiteAdvantages = input<string>('');
    blackAdvantages = input<string>('');

    // Input pour personnaliser le message "pas de conseil"
    noAdviceMessage = input<string>('Aucun conseil stratégique disponible pour cette position.');

    /**
 * Convertit une chaîne d'avantages en liste de tags
 */
    getAdvantageTagsList(advantages: string): string[] {
        if (!advantages || advantages.trim() === '') {
            return [];
        }
        return advantages.split(', ').filter(a => a.trim() !== '');
    }
} 