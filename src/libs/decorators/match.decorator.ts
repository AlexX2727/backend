import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Decorador personalizado para validar que dos campos coincidan
 * 
 * Se utiliza principalmente para verificar que la contraseña y su confirmación sean iguales
 * 
 * @param property Nombre de la propiedad a comparar
 * @param validationOptions Opciones adicionales de validación
 * @returns Decorador de validación
 * 
 * @example
 * ```typescript
 * @Match('password', { message: 'Las contraseñas no coinciden' })
 * confirmPassword: string;
 * ```
 */
export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${propertyName} debe coincidir con ${relatedPropertyName}`;
        },
      },
    });
  };
}

